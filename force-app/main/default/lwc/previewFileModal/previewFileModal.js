import { LightningElement, api } from 'lwc';
import MS_close from '@salesforce/label/c.MS_close';
import MS_file_preview from '@salesforce/label/c.MS_file_preview';
import MS_cancel from '@salesforce/label/c.MS_cancel';

export default class PreviewFileModal extends LightningElement {
    @api url;
    @api fileExtension;
    showFrame = false;
    showModal = false;

    label = {
        MS_close,
        MS_file_preview,
        MS_cancel
    };

    @api show(){
        if(this.fileExtension === "pdf") this.showFrame = true;
        else this.showFrame = false;
        this.showModal = true;
    }

    closeModal(){
        this.showModal = false;
    }
}