# WebViewer - Mendix Web Widget

[WebViewer](https://www.pdftron.com/documentation/web/) is a powerful JavaScript-based PDF Library that's part of the [PDFTron PDF SDK](https://www.pdftron.com). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into any web project.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This repo is specifically designed for any users interested in integrating WebViewer into Mendix low-code app. You can watch [a video here](https://youtu.be/bVhWXuLSL0k) to help you get started.

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Create a new or use an existing Mendix App

Open Mendix Studio Pro and create a new project by selecting `File > New Project` from the top menu bar.

After creating a new app, or inside of the existing app navigate to the app's directory and create a new folder called `CustomWidgets/webViewer` and place the extracted contents from this repository.

In terminal or command line navigate to `CustomWidgets/webViewer` and run:
```
npm install
```

After the command completes, run:
```
npm run dev
```

Next, we must copy the static assets required for WebViewer to run. The files are located in `CustomWidgets/webViewer/node_modules/@pdftron/webviewer/public` and must be moved into a location that will be served and publicly accessible. In Mendix, we can place it into `theme/resources`. Create a new folder called `lib` and place the contents from `node_modules/@pdftron/webviewer/public` there.

## Place WebViewer into a Page

1. Let's go ahead and add a new entity in the domain model of the module we would like to integrate the viewer.

2. In the properties of the newly created entity, add a new attribute of type String.

3. Next, open the page inside of your module.

4. Add a `Data view` widget by dragging it from the Toolbox. Double-click the widget, and give it a data source microflow by selecting Data source > Type > Microflow.

5. In the microflow field, click the Select button and press New.

6. Open newly created microflow, delete parameter and drag `Create object` from the toolbox onto the arrow. Open the object by double-clicking on it and select the entity we created earlier.

7. Right-click the `Create Entity` activity, then click `Set $NewEntity as Return Value`.

8. Go back to the page you placed the `data view`, and drag `Text box` into `data view`. Open the textbox's properties and select the Datasource Attribute (path) string attribute you created above.

9. Press F4, or from the top menu bar select `Project > Synchronize Project Directory`.

10. Go back to the page you placed the `data view`, in the `Add-on widgets` you should now see `Web Viewer`. Drag into the `data view`. Right-click on `Web Viewer` widget and select Attribute by selecting Attribute string you have created.

11. You can now run the app by clicking `Run Locally` at the top.

## Connect Attribute to the WebViewer

The WebViewer now loads inside of your page with the default file. Now let's connect the Attribute parameter to be accessible by the WebViewer. Attribute parameter can be used to pass a URL to open specific document.

1. Navigate to the WebViewer location inside of `App/CustomWidgets/webViewer` and open it in your favourite code editor.

2. Open WebViewer component available in `src/components/PDFViewer.tsx`. Inside of it, you can see WebViewer constructor where you can pass various customization options and call APIs on the instance object. The Attribute that you have created in previous steps is passed in `props.value`:

```javascript
useEffect(() => {
        if (instance && props.value !== "") {
            instance.loadDocument(props.value);
        }
    }, [props.value]);
```

In the code snippet, we are listening for any of the changes in `props` and then calling `loadDocument` API to load a new document. You can connect it with your existing flows or pass URLs from your file storage. Make sure you have the [CORS configured](https://www.pdftron.com/documentation/web/faq/cors-support/) in case you run into any errors.

You can now customize the widget by checking out other guides we have available. Perform your customizations inside of `src/components/PDFViewer.tsx`. Do not forget to run `npm run dev` within the Widget's console or terminal and update the files in your App by pressing F4, or from the top menu bar selecting `Project > Synchronize Project Directory`.

You can now checkout other guides like [how to open your own documents](https://www.pdftron.com/documentation/web/guides/basics/open/url/) or [how to disable certain features](https://www.pdftron.com/documentation/web/guides/hiding-elements/).

## WebViewer APIs

See [API documentation](https://www.pdftron.com/documentation/web/guides/ui/apis).

## Contributing

See [contributing](./CONTRIBUTING.md).

## License

See [license](./LICENSE).
![](https://onepixel.pdftron.com/webviewer-react-sample)
