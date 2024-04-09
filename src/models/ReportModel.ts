import { AppDataSource } from '../dataSource';
import { Report } from '../entities/Report';
import { User } from '../entities/User';
import { getUserById, getUserByUsername } from './UserModel';

const reportRepository = AppDataSource.getRepository(Report);

async function getReportById(offendingContentId: string): Promise<Report | null> {
    const report = await reportRepository.findOne({ where: { offendingContentId }});
    return report;
}

async function getAllPendingReports(): Promise<Report[]> {
    const reports = await reportRepository.find({ where: { hasBeenAddressed: false } });

    return reports;
}

async function createReport(reportType: ReportType, contentId: string): Promise<Report | null> { 
    const offendingContentId = reportType.split('')[0] + '-' +  contentId;
    
    const report = await getReportById(offendingContentId)
    
    // don't make a new report if the content has already been reported
    if (report) {
        return null;
    }

    // determine which admin handles the report
    // an admin can see all reports and take care of them as needed though
    var admin: User;
    var reportedUser: User;
    if (reportType === 'PROFILE') {
        admin = await getUserByUsername('JackTheChrest');
        reportedUser = await getUserById(contentId);
    } else if (reportType === 'EVENT') {
        admin = await getUserByUsername('Quinn');
        // reportedUser = await getUserByEventId(contentId);
    } else if (reportType === 'WALL POST') { // Wall posts and comments
        admin = await getUserByUsername('Matthew');
        // reportedUser = await getUserByWallPostId(contentId);
    } else if (reportType === 'COMMENT') {
        admin = await getUserByUsername('Matthew');
        // reportedUser = await getUserByCommentId(contentId);
    }


    let newReport = new Report();
    newReport.offendingContentId = offendingContentId;
    newReport.dateSent = new Date();
    newReport.dateString = newReport.dateSent.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit'});
    newReport.type = "REPORT";
    newReport.receivingUser = admin;
    newReport.sendingUser = reportedUser;

    newReport = await reportRepository.save(newReport); 
    return newReport
}

async function respondToReport(offendingContentId: string, isValid: boolean): Promise<Report | null> {
    const updatedReport = await getReportById(offendingContentId);
    updatedReport.hasBeenAddressed = true;
    updatedReport.isValid = isValid;

    await reportRepository
        .createQueryBuilder()
        .update(Report)
        .set({ hasBeenAddressed: true, isValid: isValid })
        .where({ offendingContentId: offendingContentId })
        .execute();

    
    return updatedReport;
}

export { getReportById, getAllPendingReports, createReport, respondToReport }
