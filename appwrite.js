import { Platform } from "react-native";
import { Client, Databases,ID } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    Platform: 'com.ujjwal.outpainter',
    projectId: '676193440024e9e819dc',
    DatabaseId: '67619730001cb97195a7',
    feedbackCollectionId : '67619779001fe61456aa',

}

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint) // Your Appwrite endpoint
  .setProject(appwriteConfig.projectId)
;

const databases = new Databases(client);

// Export the function to create a document
export const createFeedback = async (email, feedbackType, message, deviceId, base64Image, generatedImage) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.DatabaseId,            // Your Database ID
        appwriteConfig.feedbackCollectionId,  // Your Collection ID
        ID.unique(),                           // Auto-generate document ID
        {                                     // Data to store
          email: email,
          feedbackType: feedbackType,
          message: message,
          deviceId : deviceId,
          base64Image : base64Image,
          generatedImage : generatedImage,
        }
      );
      console.log("Feedback submitted successfully:", response);
      return response;
    } catch (error) {
      console.error("Error submitting feedback:", error.message);
      throw error;
    }
  };