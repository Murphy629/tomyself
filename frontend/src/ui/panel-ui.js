import './panel-theme.css'

export default {
  install(app) {
    app.directive('panel-card', {
      mounted(el) {
        el.classList.add('panel-card')
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0')
        // 自动包装一层 .panel-body，便于统一留白 & iframe 圆角
        if (!el.querySelector('.panel-body')) {
          const wrapper = document.createElement('div')
          wrapper.className = 'panel-body'
          while (el.firstChild) wrapper.appendChild(el.firstChild)
          el.appendChild(wrapper)
        }
      }
    })
  }
}
