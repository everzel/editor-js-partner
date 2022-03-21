# EditorJS Paragraph With Image Tool

![preview](./preview.png)

## Install
```
yarn add https://github.com/ScaleMeUp/editorjs-paragraph-image
```

## Usage
```js
tools: {
    paragraphImage: {
        class: ParagraphImage,
        config: {
            endpoint: 'http://localhost:8008/uploadFile',
            titlePlaceholder: 'Title',
            textPlaceholder: 'Text',
            descriptionPlaceholder: 'Description',
        },
    }
},
```
