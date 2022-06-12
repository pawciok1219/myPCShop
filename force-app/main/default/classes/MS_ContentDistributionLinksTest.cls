@IsTest
public with sharing class MS_ContentDistributionLinksTest {
    @TestSetup
    public static void testSetup() {
        ContentVersion cv=new Contentversion();
        cv.title='testTitle';
        cv.PathOnClient ='testPath';
        Blob b=Blob.valueOf('Unit Test Attachment Body');
        cv.versiondata=EncodingUtil.base64Decode('Unit Test Attachment Body');
        insert cv;
    }

    @IsTest
    public static void shouldReturnDownloadLink() {
        ContentVersion contentVersionTemp = [SELECT Id FROM ContentVersion LIMIT 1];
        String downloadLink = MS_ContentDistributionLinks.getContentDownloadUrl(contentVersionTemp.Id);
        System.assertNotEquals('',downloadLink);
    }
}
