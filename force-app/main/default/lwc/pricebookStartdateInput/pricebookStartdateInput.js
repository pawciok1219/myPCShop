import { LightningElement } from 'lwc';
import MS_startdate from '@salesforce/label/c.MS_startdate';

export default class PricebookStartdateInput extends LightningElement {

    label = {
        MS_startdate
    };

    pricebookStartdate='';

    handleKeyChange(event){
        this.pricebookStartdate = event.target.value;
        const nameEvent = new CustomEvent("getpricebookstartdate",{
            detail: this.pricebookStartdate
        });

        this.dispatchEvent(nameEvent);
    }
}