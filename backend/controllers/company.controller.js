import {Company} from '../models/company.model.js';
import getDataUri from '../utils/datauri.js';
import cloudinary from '../utils/cloudinary.js';

export const registerCompany = async (req, res) => {

 
  try {
    const {companyName} = req.body;
    if (!companyName) {
      return res.status(400).json({ message: 'Company name is required', success: false });
    }
    
    // Create the company
    let company = await Company.findOne({
      name:companyName,
    });
    if (company) {
      return res.status(400).json({ message: 'Company already exists', success: false });
    }
    company = await Company.create({
      name: companyName,
      userId: req.id
    });
    return res.status(201).json({ message: 'Company registered successfully', company, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
}

export const getCompany = async (req, res) => {
  try {
    const userId = req.params.id; // Assuming the company ID is passed as a URL parameter
    const companies = await Company.find({});
    
    if (!companies) {
      return res.status(404).json({ message: 'Companies not found', success: false });
    }
  return res.status(200).json({ companies, success: true }); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
}


export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id; // Using URL parameter as configured in routes
        const company = await Company.findById(companyId);
        
        if (!company) {
        return res.status(404).json({ message: 'Company not found', success: false });
        }
        
        return res.status(200).json({ company, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
    }


export const updateCompany = async (req, res) => {
  try {

    const {name,description,website,location} = req.body;
    const file =req.file; // Assuming you're using multer for file uploads

    const updatedData = {name, description, website, location};
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      updatedData.logo = cloudResponse.secure_url;
    }
    const company= await Company.findByIdAndUpdate(req.params.id, updatedData, { new: true });   

    
    if (!company) {
      return res.status(404).json({ message: 'Company not found', success: false });
    }
    
    return res.status(200).json({ message: 'Company updated successfully', company, success: true });
  } catch (error) {
    console.error(error);
    import('fs').then(fs => fs.appendFileSync('/tmp/update_company_error.log', error.stack + '\n'));
    return res.status(500).json({ message: 'Server error: ' + error.message, success: false });
  }
}