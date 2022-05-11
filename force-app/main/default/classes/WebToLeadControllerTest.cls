@IsTest
public class WebToLeadControllerTest {
    
    @IsTest
    public static void shouldSuccess() {
        ApexPages.currentPage().getParameters().put('success', 'true');
        WebToLeadController test = new WebToLeadController();
        System.assertEquals(WebToLeadController.successValue, true);
    }
}