import { LightningElement } from 'lwc';
import MS_enddate from '@salesforce/label/c.MS_enddate';

export default class PricebookEnddateInput extends LightningElement {

    label = {
        MS_enddate
    };

    pricebookEnddate='';

    handleKeyChange(event){
        this.pricebookEnddate = event.target.value;
        const nameEvent = new CustomEvent("getpricebookenddate",{
            detail: this.pricebookEnddate
        });

        this.dispatchEvent(nameEvent);
    }
}