const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/my-teams', teamController.getMyTeams);
router.get('/:id', teamController.getTeamDetails);

// Tasks management
router.post('/:id/tasks', teamController.addTask);
router.put('/:id/tasks/:taskId', teamController.updateTask);

// Shared files
router.post('/:id/files', upload.single('file'), teamController.uploadTeamFile);

// Notes
router.post('/:id/notes', teamController.addNote);
router.delete('/:id/notes/:noteId', teamController.deleteNote);

// Announcements
router.post('/:id/announcements', teamController.addAnnouncement);
router.delete('/:id/announcements/:annId', teamController.deleteAnnouncement);

// Invites management
router.post('/:id/invite', teamController.inviteUser);
router.post('/invitations/:notiId/:action', teamController.resolveInvitation);

// Members Administration
router.post('/:id/members', teamController.addMember);
router.put('/:id/members/:userId/role', teamController.updateMemberRole);
router.delete('/:id/members/:userId', teamController.removeMember);
router.post('/:id/close', teamController.closeProjectWorkspace);

module.exports = router;
