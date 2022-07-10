import {LightningElement, api} from 'lwc';

export default class ConfirmModal extends LightningElement {
    @api visible = false;
    @api title = ''; 
    @api name; 
    @api message = ''; 
    @api confirmLabel = ''; 
    @api cancelLabel = ''; 
    @api originalMessage; 
    handleClick(event){
        let finalEvent = {
            originalMessage: this.originalMessage,
            status: event.target.name
        };
        this.dispatchEvent(new CustomEvent('modalaction', {detail: finalEvent}));
    }
}