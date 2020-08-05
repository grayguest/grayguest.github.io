<script type="text/javascript" src="{{ url_for('js/src') }}/theme.js?v={{ theme.version }}"></script>
<script type="text/javascript" src="{{ url_for('js/src') }}/bootstrap.js?v={{ theme.version }}"></script>

<!--prettify代码高亮脚本引入-->
{% if config.prettify.enable %}
    <script src="/plugins/prettify/prettify.js"></script>
    <script type="text/javascript">
    jQuery(function($){
        $('pre').addClass('prettyprint');
        prettyPrint();
    });
    </script>
{% endif %}

<!--custom_hightlight代码高亮脚本引入-->
{% if config.custom_highlight.enable %}
    <script src="/plugins/highlight/highlight.pack.js"></script>
    <script>hljs.initHighlightingOnLoad();</script>
{% endif %}