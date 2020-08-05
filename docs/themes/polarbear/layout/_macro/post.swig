{% macro render(post) %}
  <article class="post">
    <header class="post-header">
      <h1 class="post-title">
        {% if is_home() %}
          <a class="post-link" href="{{ url_for(post.path) }}">{{ post.title }}</a>
        {% else %}
          {{ post.title }}
        {% endif %}
      </h1>

      <time class="post-time">
          {{ full_date(post.date, 'YYYY-MM-DD') }}
      </time>
    </header>



    {% if is_home() %}
        <div class="post-excerpt">
            {% set excerpt = "" %}
            {% if post.description %}
              {% set excerpt = post.description %}
            {% elif post.excerpt %}
              {% set excerpt = post.excerpt %}
            {% endif %}

            {% if excerpt %}
              {{ excerpt }}
        </div>
            {% endif %}
          {% else %}
            {% include "../_partial/toc.swig" %}
            <div class="post-content">
                {{ post.content }}
            </div>
          {% endif %}

    {% if not is_home() %}
      <footer class="post-footer">
      <ul class="post-copyright">
        <li class="post-copyright-author">
            <span>本文作者： </span>{{ theme.author }}
        </li>
        <li class="post-copyright-link">
          <span>本文链接：</span>
          <a href="{{ theme.url }}/{{ url_for(page.path) }}" title="{{ page.title }}">{{ theme.url }}/{{ page.path }}</a>
        </li>
        <li class="post-copyright-license">
          <span>版权声明： </span>
          本网站所有文章除特别声明外，均采用<a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" rel="external nofollow" target="_blank">CC BY-NC-ND 4.0</a>许可协议，非商业转载请注明出处（原文作者，原文链接），商业转载请联系作者获得授权。
        </li>
      </ul>
		{% if post.tags and post.tags.length %}
		<div class="post-tags">
		  {% for tag in post.tags %}
			<a href="{{ url_for(tag.path) }}">{{ tag.name }}</a>
		  {% endfor %}
		</div>
		{% endif %}

        {# Post Pagination #}
        {% include "../_partial/pagination.swig" %}
        {% include "../_partial/comments.swig" %}
      </footer>
    {% endif %}
  </article>
{% endmacro %}
