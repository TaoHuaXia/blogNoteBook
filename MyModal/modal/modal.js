'use strict';

(function() {
  // 校验
  const FUNC_CALL_REG = /^\w+(\(\))$/
  class BaseShadowModal extends HTMLElement {
    constructor() {
      super()

      if (!this.visible) {
        this.style.display = 'none'
      }

      const shadow = this.attachShadow({ mode: 'open' });

      const content = this.render()

      const modalContainer = document.createElement('div')
      modalContainer.innerHTML = `
        <style>
        .modal-mask {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 1000;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.65);
        }
        
        .modal-wrapper {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 1000;
          overflow: auto;
          outline: 0;
        }
        
        .modal-content {
          position: relative;
          top: 100px;
          width: 520px;
          margin: 0 auto;
          font-size: 14px;
          border-radius: 4px;
          background-color: #fff;
          box-sizing: border-box;
        }
        </style>
        <div class="modal-mask" id="mask" />
        <div class="modal-wrapper">
          <div class="modal-content">
            ${content}
          </div>
        </div>
      `

      shadow.appendChild(modalContainer)

      this.close = this.close.bind(this)
      this.open = this.open.bind(this)
      this.render = this.render.bind(this)
    }

    render() {
      return ''
    }

    close() {
      this.visible = false
    }

    open() {
      this.visible = true
    }

    set visible(visible) {
      if (visible === false) {
        this.style.display = 'none'
      } else {
        this.style.display = 'block'
      }
      this.setAttribute('visible', visible);
    }

    get visible() {
      let value = this.getAttribute('visible')
      return !(value && (value === 'false'))
    }

    get maskClosable() {
      let value = this.getAttribute('maskClosable')
      return !(value && (value === 'false'))
    }

    set maskClosable(value) {
      this.setAttribute('maskClosable', value)
    }

    set onconfirm(onconfirm) {
      // onconfirm必须是一个函数
      if (typeof onconfirm !== 'function') {
        throw new Error('onconfirm must be a function')
      }
      this._onconfirm = onconfirm
    }

    get onconfirm() {

      // 由于 eval无法进行this绑定且不安全，舍弃eval的形式
      // if (!this._onconfirm) {
      //   let attr = this.getAttribute('_onconfirm')
      //   return attr ? function () {
      //     eval(attr)
      //   } : null
      // }

      // 如果没有通过inst.onconfirm进行赋值，则从节点的属性列表查询
      if (!this._onconfirm) {
        let attr = this.getAttribute('onconfirm')

        // 检查是否有值，且为为一个正确的方法,eg:onchange()
        if (attr && FUNC_CALL_REG.test(attr)) {

          // 从window对象中获取对应函数
          let func = window[attr.replace('()', '')]

          return func && typeof func === 'function' ? func : null
        } else {
          return null
        }
      }
      return this._onconfirm
    }

    set oncancel(oncancel) {
      if (typeof oncancel !== 'function') {
        throw new Error('oncancel must be a function')
      }
      this._oncancel = oncancel
    }

    get oncancel() {
      if (!this._oncancel) {
        let attr = this.getAttribute('oncancel')
        if (attr && FUNC_CALL_REG.test(attr)) {
          let func = window[attr.replace('()', '')]
          return func && typeof func === 'function' ? func : null
        } else {
          return null
        }
      }
      return this._oncancel
    }

    get confirmBtnText() {
      return this.getAttribute('confirmBtnText')
    }

    set confirmBtnText(title) {
      this.setAttribute('confirmBtnText', title);
    }

    get cancelBtnText() {
      return this.getAttribute('cancelBtnText')
    }

    set cancelBtnText(title) {
      this.setAttribute('cancelBtnText', title);
    }

    get modalTitle() {
      return this.getAttribute('modalTitle') || '';
    }

    set modalTitle(modalTitle) {
      this.setAttribute('modalTitle', modalTitle);
    }

    // 节点挂载到DOM上之后触发
    connectedCallback() {
      this.maskClosable && this.shadowRoot.getElementById('mask').addEventListener('click', this._handleClose)

    }
  }

  // 全局的弹窗id，用于对多重弹窗进行区分
  let modal_index = 0

  class BaseHtmlModal {
    constructor(type, config) {
      this._config = {
        ...config,
        type,
        index: modal_index++
      }

      this.destroy = this.destroy.bind(this)
    }

    render() {
      this.wrapper = document.createElement('div')
      this.wrapper.id = `modal_index_${this._config.index}`
      this.wrapper.innerHTML = `
        <div class='modal'>
          <div class="modal-mask" />
          <div class="modal-wrapper">
            <div class="modal-content">
              ${this._getHtml()}
            </div>
          </div>
        </div>
      `
      document.body.appendChild(this.wrapper)

      this._bindEvents()
    }

    _bindEvents() {
    }

    _removeEvents() {
    }

    destroy() {
      this._removeEvents()
      document.body.removeChild(this.wrapper)
    }

    _getHtml() {
      return ''
    }
  }

  // 针对不同类型提供一些特殊的默认配置，比如icon
  const TYPE_CONFIG = {
    'confirm': {
      icon: '？'
    },
    'info': {
      icon: 'i'
    },
    'success': {
      icon: '√'
    },
    'error': {
      icon: '×'
    },
    'warning': {
      icon: '!'
    }
  }
  const DEFAULT_CONFIG = {
    confirmBtnText: '确定',
    cancelBtnText: '取消',
    content: ''
  }

  class EasyModal extends BaseHtmlModal {
    constructor(type, config) {
      super(type, config)
      this._config = {
        ...DEFAULT_CONFIG,
        ...this._config,
        ...TYPE_CONFIG[type],
        isConfirm: type === 'confirm'
      }

      this._handleCancel = this._handleCancel.bind(this)
      this._handleConfirm = this._handleConfirm.bind(this)
    }

    _bindEvents() {

      // 与普通弹窗不同，只有当明确配置maskCloseable为ture时才绑定遮罩关闭事件
      if (this._config.maskClosable) {
        let mask = document.querySelector(`#modal_index_${this._config.index} .modal-mask`)
        mask.addEventListener('click', this._handleCancel )
      }
      if (this._config.isConfirm) {
        let cancelBtn = document.querySelector(`#modal_index_${this._config.index} .modal-btn-cancel`)
        cancelBtn.addEventListener('click', this._handleCancel )
      }
      let confirmBtn = document.querySelector(`#modal_index_${this._config.index} .modal-btn-confirm`)
      confirmBtn.addEventListener('click', this._handleConfirm )
    }

    _handleCancel(e) {
      e.stopPropagation()

      // 如果有自定义cancel回调，则触发自定的回调，并将关闭方法作为参数传入，否则直接关闭弹窗
      if (this._config.onCancel && typeof this._config.onCancel === 'function') {
        this._config.onCancel(this.destroy)
      } else {
        this.destroy()
      }
    }

    _handleConfirm(e) {
      e.stopPropagation()

      // 同上
      if (this._config.onConfirm && typeof this._config.onConfirm === 'function') {
        this._config.onConfirm(this.destroy)
      } else {
        this.destroy()
      }
    }

    _removeEvents() {
      if (this._config.maskClosable) {
        let mask = document.querySelector(`#modal_index_${this._config.index} .modal-mask`)
        mask.removeEventListener('click', this._handleCancel )
      }
      if (this._config.isConfirm) {
        let cancelBtn = document.querySelector(`#modal_index_${this._config.index} .modal-btn-cancel`)
        cancelBtn.removeEventListener('click', this._handleCancel )
      }
      let confirmBtn = document.querySelector(`#modal_index_${this._config.index} .modal-btn-confirm`)
      confirmBtn.removeEventListener('click', this._handleConfirm )

    }

    _getHtml() {
      return `
        <div class="modal-body">
          <div>
            <i class='modal-icon'>${this._config.icon}</i>
            <span class='modal-title'>${this._config.title}</span>
            <div class='modal-detail-content'>
              ${this._config.content}
            </div>
          </div>
          <div class="modal-footer">
            ${
               this._config.isConfirm
               ? `<button class='modal-btn modal-btn-cancel'>${this._config.cancelBtnText}</button>`
               : ''
             }
             <button class='modal-btn modal-btn-confirm'>${this._config.confirmBtnText}</button>
          </div>
        </div>
      `
    }
  }

  class DefaultModal extends BaseShadowModal {
    constructor() {
      super()

      this._handleClose = this._handleClose.bind(this)
      this._handleConfirm = this._handleConfirm.bind(this)
    }

    static confirm(config) {
      let inst = new EasyModal('confirm', config)
      inst.render()
    }

    static info(config) {
      let inst = new EasyModal('info', config)
      inst.render()
    }

    static success(config) {
      let inst = new EasyModal('success', config)
      inst.render()
    }

    static error(config) {
      let inst = new EasyModal('error', config)
      inst.render()
    }

    static warning(config) {
      let inst = new EasyModal('warning', config)
      inst.render()
    }

    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.getElementById('closeBtn').addEventListener('click', this._handleClose)
      this.shadowRoot.getElementById('cancel').addEventListener('click', this._handleClose)
      this.shadowRoot.getElementById('confirm').addEventListener('click', this._handleConfirm)
    }

    _handleClose(e) {
      e.stopPropagation()

      // 对传入的回调进行this绑定以及event对象的传入
      this.oncancel ? this.oncancel.bind(this)(e) : this.close()
    }

    _handleConfirm(e) {
      e.stopPropagation()

      // 对传入的回调进行this绑定以及event对象的传入
      this.onconfirm ? this.onconfirm.bind(this)(e) : this.close()
    }

    render() {
      return `
        <style>
        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 10;
          padding: 0;
          border: 0;
          outline: 0;
          cursor: pointer;
          transition: color .3s;
        }
        
        .modal-header {
          padding: 16px 24px;
          color: rgba(0, 0, 0, 0.65);
          background: #fff;
          border-bottom: 1px solid #e8e8e8;
          border-radius: 4px 4px 0 0;
        }
        
        .modal-body {
          padding: 24px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
        }
        
        .modal-footer {
          padding: 10px 16px;
          text-align: right;
          border-top: 1px solid #e8e8e8;
          border-radius: 0 0 4px 4px;
        }
        </style>
        <button class="modal-close" id='closeBtn'>X</button>
        <div class="modal-header">${this.modalTitle}</div>
        <div class="modal-body">
          ${this.innerHTML}
        </div>
        <div class="modal-footer">
          <button class='modal-btn' id='cancel'>${this.cancelBtnText || '取消'}</button>
          <button class='modal-btn' id='confirm'>${this.confirmBtnText || '确定'}</button>
        </div>
      `
    }

  }

  customElements.define('my-modal', DefaultModal);

  window.MyModal = DefaultModal

})();