import { observer } from 'mobx-react-lite';
import React, { useState, useEffect } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

interface IssueLabelSuggestionProps {
  form: UseFormReturn;
  index: number;
}

// Mock user assignment data
const userAssignments = {
  Backend: ['prashantrajnale5', 'mayankrathod255'],
  Frontend: ['SOnu Sharma'],
  // Design: ['user5'],
  // Add more mappings as needed
};

// Function to recommend assignee based on task type
const recommendAssignee = (taskType: string) => {
  return userAssignments[taskType] || ['No-assignee']; // Default to 'No-assignee' if no users found
};

function getDescription(description: string) {
  console.log('getDescription - Raw input:', description);
  try {
    const parsed = description ? JSON.parse(description).text : '';
    console.log('getDescription - Parsed result:', parsed);
    return parsed;
  } catch (e) {
    console.log('getDescription - Parsing failed, returning raw:', description);
    return description;
  }
}

function getIfTouched(form: UseFormReturn, index: number) {
  const touchedFields = form.formState.touchedFields;
  console.log('IssueLabelSuggestion - TouchedFields:', touchedFields);

  if (touchedFields.issues && touchedFields.issues[index]) {
    const isTouched = !!touchedFields.issues[index].description;
    console.log('IssueLabelSuggestion - Is description touched:', isTouched);
    return isTouched;
  }
  return false;
}

export const IssueLabelSuggestion = observer(
  ({ form, index }: IssueLabelSuggestionProps) => {
    console.log('IssueLabelSuggestion - Component rendered');
    const [isLoading, setIsLoading] = useState(false);

    const description = useWatch({
      control: form.control,
      name: `issues.${index}.description`,
      onChange: (value) => {
        console.log('IssueLabelSuggestion - Description changed:', value);
      },
    });

    const [suggestedLabel, setSuggestedLabel] = useState<string | null>(null);
    const [recommendedAssignee, setRecommendedAssignee] =
      useState<string>('No-assignee');
    const touched = getIfTouched(form, index);
    const descriptionString = getDescription(description);

    const suggestLabel = async (descriptionText: string) => {
      console.log('suggestLabel - Starting with text:', descriptionText);
      try {
        setIsLoading(true);
        const labels = [
          'Bug',
          'Feature',
          'Design',
          'Documentation',
          'Frontend',
          'Backend',
        ];

        const messages = [
          {
            role: 'model',
            parts: [
              {
                text: `You are a helpful AI assistant that classifies software development issues into predefined labels. You will receive a description and must respond with exactly one label from the provided list: ${labels.join(', ')}.`,
              },
            ],
          },
          {
            role: 'user',
            parts: [
              {
                text: `Please classify this issue description into one of the available labels:
${descriptionText}`,
              },
            ],
          },
        ];

        console.log(
          'suggestLabel - Preparing request with messages:',
          messages,
        );

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?alt=sse&key=AIzaSyAyWRvOfxMFKQD8Kpk4hPODlswvrtHYtVU`;

        console.log('suggestLabel - Sending request to Gemini API');
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages,
          }),
        });

        console.log(
          'suggestLabel - Received response status:',
          response.status,
        );

        // Log the entire response text before parsing
        const responseText = await response.text();
        console.log('suggestLabel - Raw response text:', responseText);

        // Split the response by line breaks and parse each valid JSON object
        const responseLines = responseText
          .split('\n')
          .filter((line) => line.startsWith('data:'));
        const parsedData = responseLines.map((line) => {
          const cleanedLine = line.replace(/^data:\s*/, ''); // Remove "data: " prefix
          return JSON.parse(cleanedLine); // Parse the cleaned JSON
        });

        console.log('suggestLabel - Parsed response data:', parsedData);

        // Process the parsed data to extract labels
        const candidateTexts = parsedData.flatMap(
          (data) =>
            data.candidates?.map((candidate) =>
              candidate.content.parts.map((part) => part.text).join(''),
            ) || [],
        );

        // Filter out any empty strings and trim the results
        const validLabels = candidateTexts
          .map((text) => text.trim())
          .filter((text) => text.length > 0);

        if (validLabels.length > 0) {
          const label = validLabels[0]; // Get the first valid label
          console.log('suggestLabel - Setting label:', label);
          setSuggestedLabel(label);
          // Recommend assignee based on the suggested label
          const assignee = recommendAssignee(label);
          setRecommendedAssignee(assignee[0]); // Set the first recommended assignee
        } else {
          console.log('suggestLabel - No valid label received');
        }
      } catch (error) {
        console.error('suggestLabel - Error occurred:', error);
        console.error('suggestLabel - Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      } finally {
        console.log('suggestLabel - Request completed');
        setIsLoading(false);
      }
    };

    // Automatically set the suggested label when clicked
    const handleLabelClick = () => {
      if (suggestedLabel) {
        console.log(
          'IssueLabelSuggestion - Setting form value to:',
          suggestedLabel,
        );
        form.setValue(`issues.${index}.label`, suggestedLabel); // Set the form value
        console.log(
          'IssueLabelSuggestion - Suggested label selected:',
          suggestedLabel,
        );
        // Set the recommended assignee in the form
        form.setValue(`issues.${index}.assignee`, recommendedAssignee);
      }
    };

    // useEffect to call suggestLabel when description changes
    useEffect(() => {
      console.log('useEffect - Triggered with:', {
        descriptionString,
        touched,
        currentSuggestedLabel: suggestedLabel,
      });

      // Call suggestLabel whenever the description changes
      if (descriptionString && touched) {
        console.log('useEffect - Calling suggestLabel');
        suggestLabel(descriptionString);
      }
    }, [descriptionString, touched]);

    if (!description) {
      console.log('IssueLabelSuggestion - No description, returning null');
      return null;
    }

    return (
      <div className="p-2">
        {isLoading && (
          <span>
            {console.log('IssueLabelSuggestion - Rendering loading state')}
            Generating suggestion...
          </span>
        )}
        {suggestedLabel && (
          <div
            className="suggestion"
            onClick={handleLabelClick}
            style={{ cursor: 'pointer' }}
          >
            {console.log(
              'IssueLabelSuggestion - Rendering with label:',
              suggestedLabel,
            )}
            <p>Suggested Label: {suggestedLabel}</p>
            <p>Recommended Assignee: {recommendedAssignee}</p>
          </div>
        )}
      </div>
    );
  },
);
