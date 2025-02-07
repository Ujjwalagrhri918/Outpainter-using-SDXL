import React, { useRef, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, Image, FlatList, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { images } from "../constants"; // Assuming you have the images object with paths

const LandingPage = () => {
  const imagesArray = [images.image2, images.image3, images.image1]; // Your images array
  const flatListRef = useRef(null); // Reference for FlatList
  const [currentIndex, setCurrentIndex] = useState(0); // Current image index

  // Automatic scrolling effect
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % imagesArray.length; // Cycle through images
      setCurrentIndex(nextIndex);

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * (380 + 20), // Image width + margins
        animated: true,
      });
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [currentIndex, imagesArray.length]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <Image
            source={images.logo}
            style={styles.logo}
            resizeMode="contain"
          />

          <FlatList
            ref={flatListRef} // Attach FlatList reference
            horizontal
            data={imagesArray}
            renderItem={({ item }) => (
              <Image
                source={item}
                style={styles.cards}
                resizeMode="contain"
              />
            )}
            keyExtractor={(item, index) => index.toString()}
            snapToInterval={380 + 20} // Image width + margins
            decelerationRate="fast"
            snapToAlignment="center"
            showsHorizontalScrollIndicator={false}
          />

          <View style={styles.textContainer}>
            <Text style={styles.mainText}>
              Discover Endless{"\n"}Possibilities with{" "}
              <Text style={styles.highlightText}>OutPainter</Text>
            </Text>
          </View>

          <Text style={styles.subText}>
            Expand Your Images Beyond Boundaries with the Magic of SDXL and ControlNet
          </Text>

          <Link href="/demotemp" style={styles.link}>
            Start generating image
          </Link>
        </View>

        {/* Footer Section */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>An App By Team SRM under Samsung PRISM </Text>
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:20,
    backgroundColor: "#161622",
    flex: 1,
  },
  scrollContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 40, // Adjusted to provide space for the footer
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60, // Adjusted to provide space for the logo and other content
  },
  logo: {
    width: 130,
    height: 60,
    marginBottom: 60,
  },
  cards: {
    maxWidth: 380,
    width: 380,
    height: 250,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    marginBottom: 60,
  },
  textContainer: {
    marginTop: 10, // Reduced gap between cards and text
    marginBottom: 15,
  },
  mainText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  highlightText: {
    color: "#A0C4FF",
  },
  subText: {
    fontSize: 14,
    width: 350,
    color: "#D1D5DB",
    fontFamily: "Poppins-Regular",
    marginTop: 10, // Reduced margin for tighter spacing
    textAlign: "center",
    marginBottom: 15,
  },
  link: {
    backgroundColor: "#3498db",
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
    borderRadius: 20,
    textAlign: "center",
    textDecorationLine: "none",
    width: "auto",
    minWidth: 220,
  },
  footerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: "#A0A0A0",
    fontFamily: "Poppins-Regular",
  },
});

export default LandingPage;
