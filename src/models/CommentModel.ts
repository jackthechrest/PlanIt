import { Comment } from '../entities/Comment';
import { AppDataSource } from '../dataSource';
import { getUserById } from './UserModel';
import { getEventById } from './EventModel';

const commentRepository = AppDataSource.getRepository(Comment);

async function createNewComment(body: string, eventId: string, senderId: string): Promise<Comment> {
    const event = await getEventById(eventId);
    const user = await getUserById(senderId);

    let newComment = new Comment();
    newComment.commentText = body;
    newComment.commentUnder = event;
    newComment.commenter = user;
    newComment.commentDate = new Date();
    newComment.commentDateString = newComment.commentDate.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit'});
    newComment.commentSecondsSinceEnoch = newComment.commentDate.getTime() / 1000;


    newComment = await commentRepository.save(newComment);

    return newComment;
}

async function getCommentById(commentId: string): Promise<Comment | null> {
    return await commentRepository.findOne({where: {commentId}})
}

async function getAllCommentsByEventId(eventId: string): Promise<Comment[]> {
    return await commentRepository.find({ relations: { commentUnder: true }, where: { commentUnder: {eventId : eventId }}, order: { commentSecondsSinceEnoch: "DESC" } });
}

async function deleteCommentById(commentId: string): Promise<void> {
  await commentRepository
    .createQueryBuilder('comment')
    .delete()
    .where('commentId = :commentId', { commentId })
    .execute();
}

export { createNewComment, getCommentById, getAllCommentsByEventId, deleteCommentById }