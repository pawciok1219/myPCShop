import { LightningElement } from 'lwc';
import MS_isActive from '@salesforce/label/c.MS_isActive';

export default class PricebookIsActiveInput extends LightningElement {

    label = {
        MS_isActive
    };

    pricebookIsActive=true;

    handleKeyChange(event){
        this.pricebookIsActive = event.target.checked;
        const nameEvent = new CustomEvent("getpricebookisactive",{
            detail: this.pricebookIsActive
        });

        this.dispatchEvent(nameEvent);
    }
}