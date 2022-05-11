public class WebToLeadController {
    public static Boolean successValue {get;set;}

    public WebToLeadController() {
        Boolean successValue = showPage();
    }

    public static Boolean showPage(){
        try{
            return successValue = Boolean.valueOf(ApexPages.currentPage().getParameters().get('success'));
        }
        catch(Exception e){
            return false;
        }
    }
}