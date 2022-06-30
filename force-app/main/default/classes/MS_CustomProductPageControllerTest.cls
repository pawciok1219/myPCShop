@IsTest
public with sharing class MS_CustomProductPageControllerTest {

    @TestSetup
    public static void testSetup() {
        Pricebook2 standartPricebook = new Pricebook2(Id=Test.getStandardPricebookId(), IsActive=true);
        update  standartPricebook;
        Product2 productTest = new Product2(Name='CPU i5',Model__c='i5-4434',Producer__c='Intel',ProductCode='G88E',Family='CPU',IsActive=true);
        insert productTest;
        Product2 productTest2 = new Product2(Name='GPU RTX3060',Model__c='RTX',Producer__c='Nvidia',ProductCode='RTX3060',Family='GPU',IsActive=true);
        insert productTest2;
        PricebookEntry standartPrice = new PricebookEntry(UnitPrice=1000,Product2Id=productTest.Id, Pricebook2Id=standartPricebook.Id, IsActive=true);
        insert standartPrice;
        ProductReview__c reviewV1 = new ProductReview__c(Name='Test',Product__c=productTest.Id,Rating__c=4,Accepted__c=true);
        insert reviewV1;

        ContentVersion content=new ContentVersion(); 
        content.Title='Header_Picture1'; 
        content.FirstPublishLocationId = productTest.Id;
        content.PathOnClient='/' + content.Title + '.jpg'; 
        Blob bodyBlob=Blob.valueOf('Unit Test ContentVersion Body'); 
        content.VersionData=bodyBlob; 
        insert content;
    }

    @IsTest
    public static void shouldReturnProductUnitPrice() {
        Product2 product = [SELECT Id FROM Product2 WHERE ProductCode='G88E'];
        List<PricebookEntry> productPrice = MS_CustomProductPageController.getProductPrice(product.Id);
        System.assertEquals(1000,productPrice[0].UnitPrice);
    }

    @IsTest
    public static void shouldReturnProductAllReviews() {
        Product2 product = [SELECT Id FROM Product2 WHERE ProductCode='G88E'];
        List<ProductReview__c> reviews = MS_CustomProductPageController.getAllReviews(product.Id);
        System.assertEquals(1,reviews.size());
    }

    @IsTest
    public static void shouldReturnProductOverallRating() {
        Product2 product = [SELECT Id FROM Product2 WHERE ProductCode='G88E'];
        List<AggregateResult> overallReviews = MS_CustomProductPageController.getProductOverallRating(product.Id);
        Decimal x = (Decimal) overallReviews[0].get('overallAverage');
        System.assertEquals(4,x);
    }

    @IsTest
    public static void shouldReturnOneContentProductLink() {
        Product2 product = [SELECT Id FROM Product2 WHERE ProductCode='G88E'];
        List<ContentDocumentLink> link = MS_CustomProductPageController.getProductImages(product.Id);
        System.assertEquals(1,link.size());
    }

    @IsTest
    public static void shouldReturnOneReviewProductExists() {
        Product2 product = [SELECT Id,CreatedBy.Id FROM Product2 WHERE ProductCode='G88E'];
        List<ProductReview__c> userReviewProductExist = MS_CustomProductPageController.checkUserHaveProductReview(product.CreatedBy.Id,product.Id);
        System.assertEquals(1,userReviewProductExist.size());
    }
}
