const express = require("express");
const router = express.Router();
const Job = require("../schema/job.schema");
const authMiddleware = require("../middleware/auth");
const dotenv = require("dotenv");
dotenv.config();

// create a new job
router.post("/", authMiddleware, async (req, res) => {
  const {
    companyName,
    logoUrl,
    jobPosition,
    salary,
    jobType,
    remoteOrOffice,
    location,
    jobDescription,
    aboutCompany,
    skillsRequired,
    additionalInfo,
  } = req.body;
  if (
    !companyName ||
    !logoUrl ||
    !jobPosition ||
    !salary ||
    !jobType ||
    !remoteOrOffice ||
    !location ||
    !jobDescription ||
    !aboutCompany ||
    !skillsRequired ||
    !additionalInfo
  ) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }
  try {
    const user = req.user;
    const job = await Job.create({
      companyName,
      logoUrl,
      jobPosition,
      salary,
      jobType,
      remoteOrOffice,
      location,
      jobDescription,
      aboutCompany,
      skillsRequired,
      additionalInfo,
      user: user.id,
    });
    res.status(200).json(job);
  } catch (error) {
    return res.status(401).json({ message: "Error in creating job" });
  }
});

// fetch all jobs
router.get("/", async (req, res) => {
  //pagination, filtering and searching
  const {
    limit,
    offset,
    salary,
    name,
    jobPosition,
    jobType,
    mode,
    skillsRequired,
  } = req.query;

  // mongo query object
  const query = {};
  if (salary) {
    query.salary = { $gte: salary, $lte: salary };
  }
  if (name) {
    query.companyName = { $regex: name, $options: "i" };
  }
  if (skillsRequired) {
    // all skills must be in the skills array
    // query.skillsRequired = { $all: skillsRequired.split(",") };
    // atleast one skill must be in the skills array
    // query.skillsRequired = { $in: skillsRequired.split(","), $options: "i" };
    // made it a regex so that it remains caseinsensitive
    query.skillsRequired = {
      $in: skillsRequired.split(",").map((skill) => new RegExp(skill, "i")),
    };
  }
  // get me jobs with salary between 200000 and 300000
  // const jobs = await Job.find({salary: {$gte: 200000, $lte: 300000}}).skip(offset).limit(limit);

  // get me jobs with salary = salary
  // const jobs = await Job.find({ salary }).skip(offset).limit(limit);
  // get me jobs with which includes the companyName with name and salary with salary
  // const jobs = await Job.find({ companyName: name, salary })
  //   .skip(offset)
  //   .limit(limit);

  // jobs company name should contain name
  // const jobs = await Job.find({ companyName: { $regex: name, $options: "i" } })
  //   .skip(offset)
  //   .limit(limit);

  // jobs company name should contain name and salary = salary
  const jobs = await Job.find(query)
    .skip(offset || 0)
    .limit(limit || 50);

  const count = await Job.countDocuments(query);
  res.status(200).json({ jobs, count });
});

// find specific jobs --> read
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return res.status(404).json({
      message: "Job not found!!",
    });
  }
  res.status(200).json(job);
});

// delete specific jobs
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const job = await Job.findByIdAndDelete(id);
  const userId = req.user.id;
  if (!job) {
    return res.status(400).json({ message: "Job not found" });
  }
  if (userId !== job.user.toString()) {
    return res
      .status(401)
      .json({ message: "You are not authorized to delete this job" });
  }
  res.status(200).json({ message: "Job Deleted Successfully" });
});

// update specific job
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    companyName,
    logoUrl,
    jobPosition,
    salary,
    jobType,
    remoteOrOffice,
    location,
    jobDescription,
    aboutCompany,
    skillsRequired,
    additionalInfo,
  } = req.body;
  const job = await Job.findById(id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  if (job.user.toString() !== req.user.id) {
    return res
      .status(401)
      .json({ message: "You are not authorized to update this job" });
  }
  try {
    await Job.findByIdAndUpdate(id, {
      companyName,
      logoUrl,
      jobPosition,
      salary,
      jobType,
      remoteOrOffice,
      location,
      jobDescription,
      aboutCompany,
      skillsRequired,
      additionalInfo,
    });
    res.status(200).json({ message: "job Updated" });
  } catch (error) {
    return res.status(500).json({ message: "Error in updating job" });
  }
});

module.exports = router;
