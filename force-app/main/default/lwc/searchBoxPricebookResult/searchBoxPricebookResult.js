import { LightningElement, track, api} from 'lwc';
import MS_startdate from '@salesforce/label/c.MS_startdate';
import MS_pricebook_name from '@salesforce/label/c.MS_pricebook_name';
import MS_enddate from '@salesforce/label/c.MS_enddate';
import MS_isActive from '@salesforce/label/c.MS_isActive';

const cols = [
    { label: MS_pricebook_name, fieldName:'Name', type: 'text'},
    { label: MS_startdate, fieldName:'Start_Date__c', type: 'date', typeAttributes:
    {year: "numeric",
    month: "long",
    day: "2-digit",}},
    { label: MS_enddate, fieldName:'End_Date__c', type: 'date', typeAttributes:
    {year: "numeric",
    month: "long",
    day: "2-digit",}},
    { label: MS_isActive, fieldName:'IsActive', type: 'boolean'},
];

export default class SearchBoxPricebookResult extends LightningElement {
    @api pricebook;
    @track pricebookList = [];
    
    connectedCallback(){
        this.pricebookList.push(this.pricebook);
    }

    get column(){
        return cols;
    }
}