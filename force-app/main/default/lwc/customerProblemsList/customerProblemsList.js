import { LightningElement, wire} from 'lwc';
import getQuestions from '@salesforce/apex/MS_CaseFormController.getQuestions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import MS_error from '@salesforce/label/c.MS_error';
import MS_most_common_problems from '@salesforce/label/c.MS_most_common_problems';

export default class FaqList extends LightningElement {

    label = {
        MS_most_common_problems
    };

    customerProblemsList = [];

    @wire(getQuestions)
    wiredResult(result){ 
        this.customerProblemsList = [];
        const { data, error } = result;
        if(data){
            data.forEach(r=> {
                if(r.DataCategoryGroupName == 'Most_common_user_problems'){
                    let record = Object.assign({}, r);
                    record.Question = r.Parent.Title;
                    record.Answer = r.Parent.Answer__c;
                    this.customerProblemsList.push(record);
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