import {LightningElement, api} from 'lwc';

export default class ConfirmModal extends LightningElement {
    @api visible = false; //used to hide/show dialog
    @api title = ''; //modal title
    @api name; //reference name of the component
    @api message = ''; //modal message
    @api confirmLabel = ''; //confirm button label
    @api cancelLabel = ''; //cancel button label
    @api originalMessage; //any event/message/detail to be published back to the parent component
    //handles button clicks
    handleClick(event){
        let finalEvent = {
            originalMessage: this.originalMessage,
            status: event.target.name
        };
        this.dispatchEvent(new CustomEvent('modalaction', {detail: finalEvent}));
    }
}