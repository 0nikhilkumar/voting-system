const express = require("express");
const router = express.Router();
const { jwtAuthMiddleware } = require("../jwt/jwt.js");
const Candidate = require('../models/candiate.model.js')
const User = require('../models/user.model.js');

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        if(user.role === 'admin'){
            return true;
        }
    } catch (error) {
        return false;
    }
}

router.post('/', jwtAuthMiddleware, async (req, res)=> {
    try {
        if(! await checkAdminRole(req.user.id)) return res.status(403).json({message: 'User is not an admin'});
        const data = req.body;

        const newCandidate = await Candidate(data);
        await newCandidate.save();

        console.log('data saved'); 

        return res.status(201).json({ newCandidate });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'})
    }
});

router.get("/", async (req, res) => {
    try {
        const allCandidates = (await Candidate.find()).map((data) => {
            return {
                party: data.party,
                name: data.name,
            }
        })
        return res.status(200).json({ candidates: allCandidates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.put("/:candidateId", jwtAuthMiddleware, async (req, res)=> {
    try {
        if(! await checkAdminRole(req.user.id)) return res.status(403).json({message: 'User is not an admin'});
        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {new: true});

        if(!response){
            return res.status(404).json({ error: "Candidate not found" });
        }
        console.log('Candidate data updated');
        res.status(200).json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)) return res.status(403).json({message: 'User is not an admin'});
        const candidateId = req.params.candidateId;

        const deletedUser = await Candidate.findByIdAndDelete(candidateId);

        if(!deletedUser){
            return res.status(404).json({error: 'Candidate is not deleted'})
        }

        console.log("Candidate deleted");
        res.status(200).json({ message: "Candidate deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try {
        const candidateId = req.params.candidateId;
        const userId = req.user.id;
        const candidate = await Candidate.findById(candidateId);
        if (!candidate)
          return res.status(404).json({ error: "Candidate is not found" });

        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ error: "User is not found" });

        if(user.isVoted){
            return res
              .status(400)
              .json({ message: "User already voted" });
        }

        if (user.role === "admin")
          return res.status(400).json({ message: "User is an admin" });

        candidate.votes.push({user: userId});
        candidate.voteCount += 1;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        return res.status(200).json({ message: "Vote recorded successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.get("/vote/count", async (req, res) => {
    try {
        const candidate = await Candidate.find().sort({ voteCount: "desc" });

        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                voteCount: data.voteCount
            }
        });

        return res.status(200).json({ voteRecord });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})


module.exports = router;
