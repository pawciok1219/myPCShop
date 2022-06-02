import { LightningElement, wire, track } from 'lwc';
import getPricebook from '@salesforce/apex/MS_CustomSearchPricebook.getPricebook';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { publish, MessageContext } from 'lightning/messageService';
import recordSelected from '@salesforce/messageChannel/Record_Select__c';
import MS_startdate from '@salesforce/label/c.MS_startdate';
import MS_pricebook_name from '@salesforce/label/c.MS_pricebook_name';
import MS_enddate from '@salesforce/label/c.MS_enddate';
import MS_isActive from '@salesforce/label/c.MS_isActive';
import MS_records_not_found from '@salesforce/label/c.MS_records_not_found';
import MS_error from '@salesforce/label/c.MS_error';
import MS_search_empty from '@salesforce/label/c.MS_search_empty';
import MS_search_pricebook from '@salesforce/label/c.MS_search_pricebook';
import MS_new_pricebook from '@salesforce/label/c.MS_new_pricebook';
import MS_search from '@salesforce/label/c.MS_search';
import MS_clear from '@salesforce/label/c.MS_clear';

const cols = [
    { label: MS_pricebook_name, fieldName:'Url', type: 'url',  typeAttributes: {label: { fieldName: 'UrlName' }}},
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
export default class SearchBoxPricebook extends NavigationMixin(LightningElement){

    label = {
        MS_search_pricebook,
        MS_new_pricebook,
        MS_search,
        MS_clear
    };

    @wire(MessageContext)
    messageContext;

    @track modalTemplateOpen = false;
    @track pricebookName;
    @track isActive;
    @track startDate;
    @track endDate;
    @track pricebookList = [];
    @track isLoading = false;
    @track isNotEmpty = false;

    openNewProductModal(){
        this.modalTemplateOpen = true;
    }

    handleEndDateChanged(event){
        this.endDate = event.detail;
    }

    handlePricebookSelect(event){
        const payload = {recordId: event.target.pricebook.Id};
        publish(this.messageContext, recordSelected, payload);
    }

    get columns(){
        return cols;
    }

    handleStartDateChanged(event){
        this.startDate = event.detail;
    }

    handleProducerChange(event){
        this.producerValue = event.detail;
    }

    handleIsActiveChange(event){
        this.isActive = event.detail;
    }

    handleNameChange(event){
        this.pricebookName = event.detail;
    }

    handleSearchKeyword(){
        this.isLoading = true;
        console.log(this.startDate, this.endDate, this.pricebookName);
        if (this.pricebookName !== undefined || this.startDate !== undefined || this.endDate !== undefined) {
            getPricebook({
                pricebookName: this.pricebookName,
                isActive: this.isActive,
                startDatetime: new Date(this.startDate),
                endDatetime: new Date (this.endDate)
                })
                .then(result => {
                    this.pricebookList = [];
                    result.forEach(r=> {
                        let record =  Object.assign({}, r);
                        record.Url = `/lightning/r/Pricebook2/${r.Id}/view`;
                        record.UrlName = r.Name;
                        record.Name = r.Name;

                        this.pricebookList.push(record);
                    });
                    if(this.pricebookList.length === 0) {
                        this.isNotEmpty = false;
                        this.isLoading = false;
                        const event = new ShowToastEvent({
                            message: MS_records_not_found
                        });
                        this.dispatchEvent(event); 
                    } else {
                        this.isNotEmpty = true;
                        this.isLoading = false;
                    }
                })
                .catch(error => {
                    const event = new ShowToastEvent({
                        title: MS_error,
                        variant: 'error',
                        message: error.body.message,
                    });
                    this.dispatchEvent(event);
                    this.pricebookList = null;
                    this.isNotEmpty = false;
                    this.isLoading = false;
                });
        } else {
            this.isNotEmpty = false;
            const event = new ShowToastEvent({
                message: MS_search_empty
            });
            this.dispatchEvent(event);   
            this.isLoading = false;
        }
    }

    handleClearKeyword(){
        this.isLoading = true;
        this.pricebookName = '';
        this.isActive = false; 
        this.startDate = '';
        this.endDate = '';
        this.isNotEmpty = false;
        this.isLoading = false;
        eval("$A.get('e.force:refreshView').fire();");
    }

    handleChangeModalOpen(event){
        this.modalTemplateOpen = event.detail;
    }
}