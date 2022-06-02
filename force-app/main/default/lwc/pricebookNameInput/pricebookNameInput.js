import { LightningElement } from 'lwc';
import MS_pricebook_name from '@salesforce/label/c.MS_pricebook_name';

export default class PricebookNameInput extends LightningElement {

    label = {
        MS_pricebook_name
    };

    pricebookName='';

    handleKeyChange(event){
        this.pricebookName = event.target.value;
        const nameEvent = new CustomEvent("getpricebookname",{
            detail: this.pricebookName
        });

        this.dispatchEvent(nameEvent);
    }
}