import { LightningElement, wire} from 'lwc';
import getQuestions from '@salesforce/apex/MS_CaseFormController.getQuestions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import MS_error from '@salesforce/label/c.MS_error';

export default class FaqList extends LightningElement {

    faqList = [];

    @wire(getQuestions)
    wiredResult(result){ 
        this.faqList = [];
        const { data, error } = result;
        if(data){
            data.forEach(r=> {
                if(r.DataCategoryGroupName == 'FAQ'){
                    let record = Object.assign({}, r);
                    record.Question = r.Parent.Title;
                    record.Answer = r.Parent.Answer__c;
                    this.faqList.push(record);
                }
            });
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }

}