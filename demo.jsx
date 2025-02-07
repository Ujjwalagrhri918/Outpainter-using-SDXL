import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, Pressable, TextInput, ScrollView, Modal, Button, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { RadioButton } from 'react-native-paper'; // Ensure 'react-native-paper' is installed
import { launchImageLibrary } from 'react-native-image-picker';
import { images } from '../constants'; // Your custom image constants

import { ActivityIndicator } from 'react-native';

import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { createFeedback } from "./appwrite";
import * as Device from 'expo-device';



const Profile = () => {
  const navigation = useNavigation();

  const scrollViewRef = useRef(null);
  const feedbackRef = useRef(null);

  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('');
  const [alignment, setAlignment] = useState('Middle');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [resizeOption, setResizeOption] = useState('Full');
  const [customResize, setCustomResize] = useState('');
  const [showSteps, setShowSteps] = useState(false); // State to control modal visibility
  const [showGeneratedImage, setShowGeneratedImage] = useState(false); // Controls the display of generated image
  const [generatedImage, setGeneratedImage] = useState(null);

  const [feedbackFormVisible, setFeedbackFormVisible] = useState(false); // State for showing feedback form
  const [feedbackType, setFeedbackType] = useState(''); // State to track whether user liked or disliked the image
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [imageUri, setImageUri] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const [outputImageUrl, setOutputImageUrl] = useState(''); // State to hold the full output image URL
  const [loading, setLoading] = useState(false); // State to handle loading indicator
  
  const [likeOption, setLikeOption] = useState('');
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [dislikeReasons, setDislikeReasons] = useState({});
  const [deviceId, setDeviceId] = useState("");

  const reasons = ['aspectRatio', 'imageQuality', 'blending'];


  // Scroll to feedback form when it becomes visible
  useEffect(() => {
    if (feedbackFormVisible && feedbackRef.current) {
      feedbackRef.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
        }
      );
    }
  }, [feedbackFormVisible]);


  // Handle aspect ratio change
  const handleAspectRatioChange = (newValue) => {
    setAspectRatio(newValue);

    // Set width and height based on selected aspect ratio
    if (newValue === '1:1') {
      setWidth('1080');  // Instagram Square Post
      setHeight('1080');
    } else if (newValue === '16:9') {
      setWidth('1920');  // YouTube Video
      setHeight('1080');
    } else if (newValue === '9:16') {
      setWidth('1080');  // Instagram Stories
      setHeight('1920');
    } else if (newValue === '2:3') {
      setWidth('720');  // Pinterest Pin
      setHeight('1080');
    } else if (newValue === 'custom') {
      // Keep custom values empty to allow user input
      setWidth('');
      setHeight('');
    }
  };


  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Generate Image using AI",
      headerStyle: {
        backgroundColor: '#1e1e2d', // Set background color for header
      },
      headerTitleStyle: {
        color: '#D1D5DB', // Set color for header title
      },
      headerBackTitleStyle: {
        color: 'white', // Set the back button text color (if any)
      },
    });
  }, []);

  const imagePicker = async () => {
    console.log('Opening image picker...');

    // Request permission to access the media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Permission to access media library is required!');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Correct value
        allowsEditing: false,
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        const selectedImage = result.assets[0];
        setBase64Image(selectedImage.base64 || null);
        console.log('Image picked successfully:', selectedImage.uri);
        console.log('Base64 data set successfully');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'An error occurred while picking the image.');
    }
      

    
  };

    // Function to remove the selected image
    const removeImage = () => {
      setImageUri(null);
      setBase64Image(null);
    };
    

    const generateImage = async () => {
      console.log('Preparing to send request...');
    
      if (!base64Image) {
        console.error('No image selected. Aborting request.');
        return;
      }
    
      setLoading(true); // Show loading indicator
      setShowGeneratedImage(false); // Hide the previous image, if any
    
      // Construct the request body as JSON
      const requestBody = {
        image_base64: base64Image,
        width: parseInt(width), // Convert width to an integer
        height: parseInt(height), // Convert height to an integer
        overlap_percentage: 1, // Fixed value
        num_inference_steps: 20, // Fixed value
        resize_option: resizeOption, // Use the provided resize option
        custom_resize_percentage: 50, // Fixed value
        prompt_input: '', // Empty value for prompt
        alignment: alignment, // Use the alignment state if needed
        overlap_left: true,
        overlap_right: true,
        overlap_top: true,
        overlap_bottom: true,
      };

      //console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    
      try {
        console.log('Sending request...');
        const response = await fetch(' https://9a8a-34-126-178-93.ngrok-free.app/process-image/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
    
        console.log('Response status:', response.status);
        const data = await response.json();
        if (response.ok && data.image_base64) {
          setGeneratedImage(data.image_base64); 
          //console.log(data.image_base64);// Get the base64 string
          setShowGeneratedImage(true);
          console.log('Generated image received');
        } else {
          console.error('Error in response:', data);
        }
      } catch (error) {
        console.error('Request failed:', error);
        alert('Failed to generate the image. Please try again.');
      } finally {
        setLoading(false); // Hide loading indicator
      }
    };
    


    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    

    const submitFeedback = async () => {
      if (feedbackType === 'like' && likeOption === 'Sure, I would love to' && !email) {
        alert('Please provide your Gmail ID.');
        return;
      }
  
      if ((feedbackType === 'like' && likeOption === 'Sure, I would love to' && !message) ||
          (feedbackType === 'dislike' && !email)) {
        alert('Please fill out all required fields.');
        return;
      }

      if (email && !isValidEmail(email)) {
        alert('Please provide a valid email address.');
        return;
      }
  
      let dislikeMessage = '';
      if (feedbackType === 'dislike') {
        // Generate message from selected reasons
        dislikeMessage = `Reasons: ${Object.keys(dislikeReasons)
          .filter((key) => dislikeReasons[key])
          .join(', ')}`;
      }
  
      // Log feedback message to console
      if (Device.manufacturer && Device.modelName) {
        setDeviceId(`${Device.manufacturer}: ${Device.modelName}`);
      } else {
        setDeviceId("Unknown Device");
      }
      // Log feedback message to console
      const feedbackData = {
        email,
        message: feedbackType === 'dislike' ? dislikeMessage + ` - ${message}` : message,
        feedbackType,
        deviceId,
        base64Image,
        generatedImage

      };
  
      const response = await createFeedback(feedbackData.email, feedbackData.feedbackType, feedbackData.message, feedbackData.deviceId, feedbackData.base64Image, feedbackData.generatedImage);
      alert("Success", "Feedback submitted successfully!");
  
      // Reset feedback form
      setFeedbackFormVisible(false);
      setEmail('');
      setMessage('');
      setLikeOption('');
      setDislikeReasons({
        aspectRatio: false,
        imageQuality: false,
        blending: false,
      });
      alert('Thank you for your feedback!');
    };


  // Function to handle feedback type (like/dislike)
  const handleFeedback = (type) => {
    setFeedbackType(type);
    setFeedbackFormVisible(true);
    setLikeOption('');  // Reset the like option when feedback form is opened
    setShowAdditionalFields(false); // Reset additional fields visibility
    setDislikeReasons({
      aspectRatio: false,
      imageQuality: false,
      blending: false,
    });
    setMessage('');
  };

  // Function to handle the selection of "Like" option
  const handleLikeOptionChange = (value) => {
    setLikeOption(value);
    if (value === 'Sure, I would love to') {
      setShowAdditionalFields(true);
      setMessage(''); // Reset message to avoid appending the "No thanks" message
    } else if (value === 'No thanks') {
      setMessage(''); // Append "No thanks" to the feedback message
    }
  };

  // Function to handle checkbox change for dislike reasons
  const handleDislikeReasonChange = (reason) => {
    setDislikeReasons((prev) => ({
      ...prev,
      [reason]: !prev[reason],
    }));
  };

  
  

  return (
    <View style={styles.container}>
      {/* Help Section */}
      <Pressable onPress={() => setShowSteps(true)}>
        <Text style={styles.helpText}>
          Need help using the app?{' '}
          <Text style={{ color: '#1E90FF', textDecorationLine: 'underline' }}>Click here</Text>
        </Text>
      </Pressable>
  
      {/* Modal for Steps */}
      <Modal
        visible={showSteps}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSteps(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowSteps(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <Image source={images.step1} style={styles.cards1} resizeMode="contain" />
              <Image source={images.step2} style={styles.cards1} resizeMode="contain" />
              <Image source={images.step3} style={styles.cards1} resizeMode="contain" />
            </ScrollView>
          </View>
        </View>
      </Modal>
  
      <ScrollView ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 20 }}>
        
  
        <Text style={styles.headerText}>Upload Image</Text>
  
        {/* Image upload section */}
        <Pressable onPress={imagePicker} style={styles.imageContainer}>
          {!image ? (
            <Image source={require('../assets/icons/uploadimg2.png')} style={styles.cards} resizeMode="contain" />
          ) : (
            <Image source={{ uri: image }} style={styles.cards} resizeMode="contain" />
          )}
        </Pressable>

      {/* Aspect Ratio Options */}
      <Text style={styles.subHeading}>Aspect Ratio</Text>
      <View style={styles.radioContainer}>
        <RadioButton.Group onValueChange={handleAspectRatioChange} value={aspectRatio}>
          <View style={styles.radioOption}>
            <RadioButton value="1:1" color="#A0C4FF" />
            <Text style={styles.radioText}>Square Post (1:1)</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="16:9" color="#A0C4FF" />
            <Text style={styles.radioText}>YouTube Video (16:9)</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="9:16" color="#A0C4FF" />
            <Text style={styles.radioText}>Instagram Stories (9:16)</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="2:3" color="#A0C4FF" />
            <Text style={styles.radioText}>Pinterest Pin (2:3)</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="custom" color="#A0C4FF" />
            <Text style={styles.radioText}>Custom</Text>
          </View>
        </RadioButton.Group>
      </View>

        {/* If Custom aspect ratio is selected, show width and height input fields */}
      {aspectRatio === 'custom' && (
        <>
          <Text style={styles.subHeading}>Custom Dimensions</Text>
          <TextInput
            placeholder="Width"
            placeholderTextColor="#D1D5DB"
            value={width}
            onChangeText={setWidth}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Height"
            placeholderTextColor="#D1D5DB"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Resize input size section */}
          <Text style={styles.subHeading}>Resize Input Size</Text>
          <View style={styles.radioContainer}>
            <RadioButton.Group onValueChange={newValue => setResizeOption(newValue)} value={resizeOption}>
              <View style={styles.radioOption}>
                <RadioButton value="Full" color="#A0C4FF" />
                <Text style={styles.radioText}>Full</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="1/2" color="#A0C4FF" />
                <Text style={styles.radioText}>1/2</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="1/3" color="#A0C4FF" />
                <Text style={styles.radioText}>1/3</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="1/4" color="#A0C4FF" />
                <Text style={styles.radioText}>1/4</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="custom" color="#A0C4FF" />
                <Text style={styles.radioText}>Custom</Text>
              </View>
            </RadioButton.Group>
          </View>

          {/* If Custom resize option is selected, show resize width and height input fields */}
          {resizeOption === 'custom' && (
            <>
              <TextInput
                placeholder="Resize Width"
                placeholderTextColor="#D1D5DB"
                value={customResize}
                onChangeText={setCustomResize}
                keyboardType="numeric"
                style={styles.input}
              />
            </>
          )}
        </>
      )}
  
        {/* Alignment Label and Dropdown */}
        <Text style={styles.subHeading}>Alignment:</Text>
        <Picker
          selectedValue={alignment}
          onValueChange={(itemValue) => setAlignment(itemValue)}
          style={styles.picker}
          dropdownIconColor="#A0C4FF"
        >
          <Picker.Item label="Middle" value="Middle" />
          <Picker.Item label="Left" value="Left" />
          <Picker.Item label="Right" value="Right" />
          <Picker.Item label="Top" value="Top" />
          <Picker.Item label="Bottom" value="Bottom" />
        </Picker>
  
        {/* Submit button */}
        <Pressable style={styles.submitButton} onPress={generateImage}>
          <Text style={styles.buttonText}>Generate Image</Text>
        </Pressable>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Generating Image...</Text>
          </View>
        )}


        {!loading && showGeneratedImage && (
          <View style={styles.generatedImageContainer}>
            {/* Generated Image */}
            {generatedImage && (
              <Image
                source={{ uri: `data:image/png;base64,${generatedImage}` }}
                style={styles.cards}
                resizeMode="contain"
              />
            )}

            {/* Result URL - Not needed anymore since we are using base64 */}
            {/* If you still want to display the base64 string, uncomment below */}
            {/* <Text style={styles.resultUrlText}>URL: {generatedImage}</Text> */}
          </View>
        )}


        {/* Buttons to Save and Reset */}
        {!loading && showGeneratedImage && (
          <>
              <Pressable style={styles.submitButton} onPress={generateImage}>
                <Text style={styles.buttonText}>Regenerate Image</Text>
              </Pressable>
            {/* Like and Dislike Buttons */}
            <View style={styles.buttonsContainer}>
              <Pressable style={styles.button} onPress={() => handleFeedback('like')}>
                <Text style={styles.buttonText}>Like</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={() => handleFeedback('dislike')}>
                <Text style={styles.buttonText}>Dislike</Text>
              </Pressable>
            </View>

            {/* Like/Dislike Feedback */}
      

            {/* Feedback Form */}
            {feedbackFormVisible && (
              <View ref={feedbackRef} style={styles.feedbackFormContainer}>
                <Text style={styles.feedbackText}>
                  {feedbackType === 'like'
                    ? 'Good to hear you love that!😊 \n\n Please provide some suggestions on how we can make it even better.'
                    : "Sorry to hear you didn't like it.😔\n\n We would appreciate any suggestions you may have for improvement."}
                </Text>

                {/* Like Option - Radio Buttons */}
                {feedbackType === 'like' && (
                  <View style={styles.radioContainer}>
                    <Text style={styles.subHeading}>
                      Would you like to provide additional feedback?
                    </Text>
                    <RadioButton.Group
                      onValueChange={handleLikeOptionChange}
                      value={likeOption}
                    >
                      <View style={styles.radioOption}>
                        <RadioButton value="Sure, I would love to" color="#A0C4FF" />
                        <Text style={styles.radioText}>Sure, I would love to</Text>
                      </View>
                      <View style={styles.radioOption}>
                        <RadioButton value="No thanks" color="#A0C4FF" />
                        <Text style={styles.radioText}>No thanks</Text>
                      </View>
                    </RadioButton.Group>
                  </View>
                )}

                {/* Additional Feedback for "Like" */}
                {feedbackType === 'like' && likeOption === 'Sure, I would love to' && (
                  <>
                    <TextInput
                      placeholder="Gmail ID"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Feedback Message"
                      value={message}
                      onChangeText={setMessage}
                      style={[styles.input, styles.textArea]}
                      multiline={true}
                      numberOfLines={4}
                    />
                  </>
                )}

                {/* No Thanks Option */}
                {feedbackType === 'like' && likeOption === 'No thanks' }

                {/* Dislike Option - Custom Toggle Buttons */}
                {feedbackType === 'dislike' && (
                  <View style={styles.dislikeFormContainer}>
                    <TextInput
                      placeholder="Gmail ID"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      style={styles.input}
                    />
                    <Text style={styles.subHeading}>
                      Please select the reasons for your dislike:
                    </Text>
                    <View style={styles.buttonContainer}>
                    {reasons.map((reason) => (
                      <TouchableOpacity
                        key={reason}
                        style={[
                          styles.buttonOther,
                          dislikeReasons[reason] && styles.buttonSelectedOther, // Apply selected style conditionally
                        ]}
                        onPress={() => handleDislikeReasonChange(reason)} // Toggle function
                      >
                        <Text
                          style={[
                            styles.buttonTextOther,
                            dislikeReasons[reason] && styles.buttonTextSelectedOther, // Apply selected text style conditionally
                          ]}
                        >
                          {reason.replace(/([A-Z])/g, ' $1').trim()} {/* Formats camelCase to readable text */}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    </View>
                    <TextInput
                      placeholder="Feedback Message (Optional)"
                      value={message}
                      onChangeText={setMessage}
                      style={[styles.input, styles.textArea]}
                      multiline={true}
                      numberOfLines={4}
                    />
                  </View>
                )}

                {/* Submit Button */}
                <Pressable style={styles.submitButton} onPress={submitFeedback}>
                  <Text style={styles.buttonText}>Submit Feedback</Text>
                </Pressable>
              </View>
            )}
                </>
              )}
      </ScrollView>
    </View>
  );
};  
export default Profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#161622", // Primary background color
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  headerText: {
    fontSize: 18,
    color: "#D1D5DB", // Set header title color
    fontWeight: "bold",
    marginBottom: 0,
    marginTop: 10,
  },
  
  helpText: {
    fontSize: 18,
    color: "#D1D5DB",
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,
    paddingLeft:10,

  },
  cards: {
    width: "90%",
    height: 298,
    borderRadius: 20,
  }, 
  subHeading: {
    fontSize: 18,
    color: "#D1D5DB", // Light gray color for headings
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 20,
    paddingLeft:5,
  },
  input: {
    height: 60,
    borderColor: "#A0C4FF",
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "white",
    backgroundColor: "#1e1e2d", // Set background color for input fields
    marginBottom: 20,
    fontSize: 16, // Set consistent font size
  },
  radioContainer: {
    marginBottom: 20,
    backgroundColor: "#1e1e2d", // Set background color for radio section
    borderRadius: 10,
    padding: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  radioText: {
    color: "white",
    fontSize: 16, // Set consistent font size
  },
  picker: {
    color: "#A0C4FF",
    marginBottom: 20,
    backgroundColor: "#1e1e2d", // Set background color for picker
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16, // Set consistent font size
  },
  submitButton: {
    backgroundColor: "#0e0e15",
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom:10,
    marginTop:10,
    margin:0,
    padding:20,
    alignItems: "center",
    borderWidth: 2,           // Add border width
    borderColor: '#1e1e2d', 

  },
  submitButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  popupContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    backgroundColor: "#1e1e2d", // Background color for popup
    borderRadius: 15,
    width: "90%",
    padding: 20,
    maxHeight: "80%",
  },
  popupCloseButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  popupCloseText: {
    fontSize: 18,
    color: "#A0C4FF",
    fontWeight: "600",
  },
  popupScroll: {
    flexGrow: 1,
  },
  horizontalScroll: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 5, 
     // Center items horizontally
    
  },
  cards1: {
    width: 300, // Fixed width for consistency
    height: 400,
    borderRadius: 10,
    marginHorizontal: 10, // Added spacing between images
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black for better visibility
    borderRadius: 15,
    padding: 8,
  },
  closeButtonText: {
    color: '#FFFFFF', // White text for better contrast
    fontSize: 18,
    fontWeight: 'bold',
  },
  blurredContent: {
    opacity: 0.5, // Ensures semi-transparency for the blurred background
  },
  modalContent: {
    backgroundColor: '#1e1e2d',
    borderRadius: 15,
    width: '90%',
    padding: 20,
    maxHeight: '80%',
    justifyContent: 'center', // Center items vertically in the modal
    alignItems: 'center', // Center items horizontally in the modal
  },
  generatedImageContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20
  },
  
  generatedImage: {
    width: 350,
    height: 200,
    borderRadius: 8,
  },
  
  buttonsContainer: {
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: 'row', // Align buttons in a row
    justifyContent: 'space-between', // Ensure equal space between the buttons
    alignItems: 'center',
    marginTop: 20,
    
  },

  button: {
    backgroundColor: '#1e1e2d',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: 150,

  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
  },
  feedbackFormContainer: {
    marginTop: 20,
    margin:-20,
    padding: 20,
    backgroundColor: '#1e1e2d',
    borderRadius: 8,
  },
  feedbackButton: {
    backgroundColor: '#A0C4FF',
    padding: 10,
    borderRadius: 5,
  },
  feedbackButtonText: {
    fontSize: 16,
    color: 'white',
  },
  
  feedbackText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
  },


  input: {
    backgroundColor: '#3d3d5b',
    color: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  textArea: {
    height: 100, // Make the message input taller
  },
  submitButtonText: {
    color: '#1e1e2d',
    textAlign: 'center',
    fontSize: 16,
  },
  resultUrlText: {
    marginTop: 10,               // Adds some spacing from the image
    color: '#007AFF',            // Typical blue color for hyperlinks
    fontSize: 14,                // Reasonable size for links
    textAlign: 'center',         // Center-align the text
    textDecorationLine: 'underline', // Adds an underline to resemble a hyperlink
    paddingHorizontal: 10,       // Adds some padding for easier clicking
  },
  loadingContainer: {
    flex: 1,                   // Ensures the container takes up the full available space
    justifyContent: 'center',  // Centers the content vertically
    alignItems: 'center',      // Centers the content horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adds a semi-transparent black background
    position: 'absolute',      // Positions it over the entire screen
    top: 0,                    // Starts at the top of the screen
    left: 0,                   // Starts at the left of the screen
    right: 0,                  // Stretches to the right edge
    bottom: 0,                 // Stretches to the bottom edge
    zIndex: 10,                // Ensures it overlays other components
  },
  
  loadingText: {
    marginTop: 10,             // Adds space between the spinner and text
    fontSize: 18,              // Adjusts the text size for readability
    fontWeight: 'bold',        // Makes the text stand out
    color: '#ffffff',          // White text color for contrast
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  removeIcon: {
    position: 'absolute',
    top: 35,
    right: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Optional: Adds background to the icon for better visibility
    borderRadius: 20,  // Optional: Round button
    padding: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 7,
  },
  buttonOther: {
    backgroundColor: '#3d3d5b', // Default background color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    margin:'5',
  },
  buttonSelectedOther: {
    backgroundColor: '#1e1e2d', // Selected state background color
  },
  buttonTextOther: {
    color: '#ffffff', // Default text color
    fontSize: 16,
  },
  buttonTextSelectedOther: {
    color: '#dcdcdc', // Slightly lighter text color when selected
  },
  
});





