import ToolboxIcon from './svg/toolbox.svg';
import PlaceholderImage from './svg/img-placeholder.svg';
import './index.css';
import Uploader from './uploader';

const LOADER_DELAY = 500;

/**
 * Partner tool
 */
export default class Partner {
  /**
   * @param data
   * @param config
   * @param api
   */
  constructor({ data, config, api }) {
    this.api = api;

    this.nodes = {
      wrapper: null,
      image: null,
      line: null
    };

    this.config = {
      endpoint: config.endpoint || '',
      field: config.field || 'image',
      types: config.types || 'image/*',
      additionalRequestData: config.additionalRequestData || {},
      additionalRequestHeaders: config.additionalRequestHeaders || {}
    };

    /**
     * Set saved state
     */
    this.data = data;

    /**
     * Module for image files uploading
     */
    this.uploader = new Uploader({
      config: this.config,
      onUpload: (response) => this.onUpload(response),
      onError: (error) => this.uploadingFailed(error)
    });
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   */
  static get toolbox() {
    return {
      icon: ToolboxIcon,
      title: 'Партнер'
    };
  }

  /**
   * @param response
   */
  onUpload(response) {
    const { body: { success, file } } = response;

    if (success && file && file.url) {
      this.data.image = file;

      this.showFullImage();
    }
  }

  /**
   * On success: remove loader and show full image
   */
  showFullImage() {
    setTimeout(() => {
      this.nodes.image.classList.remove(this.CSS.loader);
      this.setImage(this.data.image.url);
    }, LOADER_DELAY);
  }

  /**
   * On fail: remove loader and reveal default image placeholder
   */
  stopLoading() {
    setTimeout(() => {
      this.nodes.image.classList.remove(this.CSS.loader);
      this.nodes.image.removeAttribute('style');
    }, LOADER_DELAY);
  }

  /**
   * Show loader when file upload started
   */
  addLoader() {
    this.nodes.image.style.background = 'none';
    this.nodes.image.classList.add(this.CSS.loader);
  }

  /**
   * If file uploading failed, remove loader and show notification
   * @param {string} errorMessage -  error message
   */
  uploadingFailed(errorMessage) {
    this.stopLoading();

    this.api.notifier.show({
      message: errorMessage,
      style: 'error'
    });
  }

  /**
   * Tool's CSS classes
   */
  get CSS() {
    return {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,
      loader: this.api.styles.loader,

      /**
       * Tool's classes
       */
      wrapper: 'cdx-partner-image',
      card: 'cdx-partner-image__card',
      fields: 'cdx-partner-image__fields',
      image: 'cdx-partner-image__image',
      title: 'cdx-partner-image__title',
      text: 'cdx-partner-image__text',
      description: 'cdx-partner-image__description',
      deleteImageButton: 'cdx-partner-image__delete-img-btn',
      line: 'cdx-partner-image__line'
    };
  }

  /**
   * @param toolsContent
   * @returns {*}
   */
  save(toolsContent) {
    return this.data;
  }

  /**
   * Renders Block content
   * @return {HTMLDivElement}
   */
  render() {
    const { image } = this.data;

    this.nodes.wrapper = this.make('div', [this.CSS.baseClass, this.CSS.wrapper]);

    // Image
    this.nodes.image = this.make('div', this.CSS.image);

    if (image) {
      this.setImage(image.url);
    } else {
      this.setImagePlaceholder();
    }

    const deleteImageButton = this.make('button', this.CSS.deleteImageButton);

    this.api.tooltip.onHover(deleteImageButton, 'Delete', {
      placement: 'top',
      hidingDelay: 500
    });

    deleteImageButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.setImagePlaceholder();
      this.data.image = null;
    });

    this.nodes.image.appendChild(deleteImageButton);

    this.nodes.image.addEventListener('click', () => {
      this.uploader.uploadSelectedFile({
        onPreview: () => {
          this.addLoader();
        }
      });
    });

    const cardWrapper = this.make('div', this.CSS.card);

    cardWrapper.appendChild(this.nodes.image);

    this.nodes.wrapper.appendChild(this.make('div', this.CSS.line));
    this.nodes.wrapper.appendChild(cardWrapper);
    this.nodes.wrapper.appendChild(this.make('div', this.CSS.line));

    return this.nodes.wrapper;
  }

  /**
   * @param {string} url
   */
  setImage(url) {
    this.nodes.image.style.background = `url('${url}') center center / contain no-repeat`;
  }

  /**
   * Set image placeholder
   */
  setImagePlaceholder() {
    this.nodes.image.style.background = `#f6f6f9 url('data:image/svg+xml,${PlaceholderImage}') center center no-repeat`;
  }

  /**
   * Check if text content is empty and set empty string to inner html.
   * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
   *
   * @param {KeyboardEvent} e - key up event
   */
  onKeyUp(e) {
    if (e.code !== 'Backspace' && e.code !== 'Delete') {
      return;
    }

    const { textContent } = this.nodes.text;

    if (textContent === '') {
      this.nodes.text.innerHTML = '';
    }
  }

  /**
   * Validate Paragraph block data:
   * - check for emptiness
   *
   * @param {ParagraphImageData} savedData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(savedData) {
    return savedData.text.trim() !== '';
  }

  /**
   * Helper method for elements creation
   * @param tagName
   * @param classNames
   * @param attributes
   * @return {HTMLElement}
   */
  make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (const attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }
}
