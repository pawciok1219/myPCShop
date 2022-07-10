import { LightningElement,api} from 'lwc';

export default class ConfirmSubmitModal extends LightningElement {
    @api content;
    @api title;
    isConfirm = false;

    closeModalSuccess(){
        this.isConfirm = true;
        const closeModal = new CustomEvent('closemodal',{detail: this.isConfirm});
        this.dispatchEvent(closeModal);  
        this.isConfirm = false;
    }

    closeModal(){
        const closeModal = new CustomEvent('closemodal',{detail: this.isConfirm});
        this.dispatchEvent(closeModal);  
    }

}