import { AppDataSource } from '../dataSource';
import { Report } from '../entities/Report';
import { User } from '../entities/User';
import { deleteCommentById, getCommentById } from './CommentModel';
import { updateFollows } from './FollowModel';
import { updateMessageThreads } from './MessageThreadModel';
import { updateNotifications } from './NotificationsModel';
import { getUserByCommentId, getUserByEventId, getUserById, getUserByUsername, updateProfile } from './UserModel';

const reportRepository = AppDataSource.getRepository(Report);

async function getReportById(offendingContentId: string): Promise<Report | null> {
    const report = await reportRepository.findOne({ where: { offendingContentId }, relations: { receivingUser: true, sendingUser: true}});
    return report;
}

async function getAllPendingReports(): Promise<Report[]> {
    const reports = await reportRepository.find({ where: { hasBeenAddressed: false }, order: {secondsSinceEnoch: "ASC"} });

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
    var link: string;
    if (reportType === 'PROFILE') {
        admin = await getUserByUsername('JackTheChrest');
        reportedUser = await getUserById(contentId);
        link = `/users/${contentId}`
    } else if (reportType === 'EVENT') {
        admin = await getUserByUsername('Quinn');
        reportedUser = await getUserByEventId(contentId);
        link = `/events/${contentId}`
    } else if (reportType === 'COMMENT') {
        admin = await getUserByUsername('Matthew');
        const comment = await getCommentById(contentId);
        link = `/events/${comment.commentUnder.eventID}/comments/${contentId}`
        reportedUser = await getUserByCommentId(contentId);
    }

    let newReport = new Report();
    newReport.offendingContentId = offendingContentId;
    newReport.dateSent = new Date();
    newReport.dateString = newReport.dateSent.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit', timeZone: 'America/Chicago'});
    newReport.secondsSinceEnoch = newReport.dateSent.getTime() / 1000;
    newReport.type = "REPORT";
    newReport.receivingUser = admin;
    newReport.receivingUserId = admin.userId;
    newReport.sendingUser = reportedUser;
    newReport.sendingUserId = reportedUser.userId;
    newReport.sendingUsername = reportedUser.username;
    newReport.sendingDisplayName = reportedUser.displayName;
    newReport.sendingPictureOptions = reportedUser.pictureOptions;
    newReport.link = link;

    newReport = await reportRepository.save(newReport); 
    return newReport
}

async function respondToReport(offendingContentId: string, isValid: boolean): Promise<Report | null> {
    const updatedReport = await getReportById(offendingContentId);
    updatedReport.hasBeenAddressed = true;
    updatedReport.isValid = isValid;

    if (isValid) {
        const type = updatedReport.offendingContentId.charAt(0);
        const contentId = updatedReport.offendingContentId.slice(2)
        if (type === "P") {
            await updateProfile(contentId, "PlanIt User", "I Love Planning Events on PlanIt!", "no change", "no change", "no change");
            await updateFollows(contentId, "PlanIt User", "no change", "no change", "no change");
            await updateNotifications(contentId, "PlanIt User", "no change", "no change", "no change");
            await updateMessageThreads(contentId, "PlanIt User", "no change", "no change", "no change");
        } else if (type === "E") {
            // await deleteEvent(contentId);
        } else {
            await deleteCommentById(contentId);
        }
    }

    await reportRepository
        .createQueryBuilder()
        .update(Report)
        .set({ hasBeenAddressed: true, isValid: isValid })
        .where({ offendingContentId: offendingContentId })
        .execute();

    return updatedReport;
}

async function hasUnreadReports(): Promise<Boolean> {
    const reports = await reportRepository.find({ where: { hasBeenAddressed: false }});

    if (reports.length !== 0) {
        return true;
    }

    return false;
}

export { getReportById, getAllPendingReports, createReport, respondToReport, hasUnreadReports }
