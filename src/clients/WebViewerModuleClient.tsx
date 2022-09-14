class WebViewerModuleClient {
    async checkForModule(): Promise<boolean> {
        try {
            const res = await fetch("/rest/version/v1/modules/webviewer");
            console.info("[Module] Connected:", await res.text());
            return true;
        } catch (e) {
            console.info("[Module] Not detected.");
            return false;
        }
    }
    async updateFile(fileId: string, fileData: ArrayBuffer): Promise<void> {
        if (!fileId) {
            console.warn("Empty file ID was provided.");
            return;
        }
        try {
            await fetch(`/rest/documentstore/v1/documents/${fileId}`, {
                method: "PUT",
                body: fileData
            });
        } catch (e) {
            console.info("[Module] Failed to save document.", e);
        }
    }
}

export default new WebViewerModuleClient();
