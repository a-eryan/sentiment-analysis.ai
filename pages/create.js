//pages/create.js
import { useState, useEffect, useRef } from 'react';
import { set, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr'
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { getHCaptchaConfig } from '../hcaptcha.config';
import Sidebar from '@/components/Sidebar';
import SubmitSentiSheetIcon from '../public/SentiSheetRequest.svg';
import SentiSheetProcessRequest from '../public/SentiSheetProcessRequest.svg';
import SentiSheetViewProcessedSentiSheet from '../public/SentiSheetViewProcessedSentiSheet.svg';
import Speed from '../public/Speed.svg';
import Intelligence from '../public/Intelligence.svg';

const {siteKey } = getHCaptchaConfig();

function ProgressBar({ value, max }) {
  return (
    <div className="flex flex-col justify-center items-center px-4">
      {/* shrink-wrapped column so the progress bar matches the icon row's width */}
      <div className="flex flex-col items-center mt-4">
        <div className="flex flex-row items-center gap-4 sm:gap-16 lg:gap-32">
          <div className="flex flex-col items-center">
            <SubmitSentiSheetIcon className="dark:invert w-8 h-8 sm:w-auto sm:h-auto"/>
            <span className="text-xs sm:text-lg lg:text-2xl font-bold text-center">Create New SentiSheet</span>
          </div>
          <div className="flex flex-col items-center">
            <SentiSheetProcessRequest className="dark:invert w-8 h-8 sm:w-auto sm:h-auto"/>
            <span className="text-xs sm:text-lg lg:text-2xl font-bold text-center">Processing Request</span>
          </div>
          <div className="flex flex-col items-center">
            <SentiSheetViewProcessedSentiSheet className="dark:invert w-8 h-8 sm:w-auto sm:h-auto"/>
            <span className="text-xs sm:text-lg lg:text-2xl font-bold text-center">View Results</span>
          </div>
        </div>
      {/*custom progress bar due to CSS issues with <progress> element*/}
        <div className="mt-2 self-stretch h-4 bg-foreground rounded-full border">
          <div
            className="h-full bg-background rounded-full transition-all"
            style={{ width: `${(value / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}


export default function NewSentiSheetWithPreview({ isPremiumUser, isAnonymous }) {
  const { register, handleSubmit, resetField, formState: { errors, isSubmitting, isValid }, setValue, watch } = useForm({
    mode: 'onChange' //enable real-time validation
  });
  const [previewData, setPreviewData] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(''); //for backend preview errors 
  const [selectedSheet, setSelectedSheet] = useState('');
  const [submitError, setSubmitError] = useState('');  //for backend submission errors upon submission
  const [captchaToken, setCaptchaToken] = useState();
  const captcha = useRef();

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);

  // Reset captcha when there's a submit error
  useEffect(() => {
    if (submitError && isAnonymous && captcha.current) {
      captcha.current.resetCaptcha();
      setCaptchaToken(null);
    }
  }, [submitError, isAnonymous]);


  /*register: registers individual input fields for validation
    handleSubmit: handles form submission and validation
    formState: contains information about the form's state, including errors
    setValue: programmatically sets the value of a form field
    watch: subscribes to form field changes
  */
  const router = useRouter(); //to redirect when successful POST 

  const sentimentClassification = watch('sentimentClassification');

  useEffect(() => {
    // Clear custom sentiments if sentimentClassification changes away from 'Custom'
    if (sentimentClassification !== 'Custom') {
      resetField('customSentiments'); //resets value AND error
    }
  }, [sentimentClassification, resetField]);

  const calculateProgress = () => {
    let progress = 0;
    if (previewData) progress++;
    if (watch('sentimentClassification')) progress++;
    if (watch('aiModel')) progress++;
    if (isSubmitting) progress++;
    return (progress / 3); // Return percentage
  };


  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setPreviewData(null);
      setSelectedColumn(null);
      setSelectedSheet('');
      return;
    }

    await loadPreview(file, ''); //load with default sheet
  }

  const loadPreview = async (file, sheetName = '') => {
    setIsLoadingPreview(true);
    setPreviewError(''); 
    
    setPreviewData(null);
    setSelectedColumn(null);
    setValue('textColumn', '');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (sheetName) {
        formData.append('sheetName', sheetName);
      }

      console.log('Loading preview for sheet:', sheetName || 'default');

      const response = await fetch('/api/preview', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to preview file: ' + (await response.json()).error);
      }

      const preview = await response.json();
      console.log('Preview response:', preview);
      
      setPreviewData(preview);
      setSelectedSheet(preview.currentSheet || '');
      
      // Auto-select first column by default
      setSelectedColumn(1);
      setValue('textColumn', '1');

    } catch (error) {
      setPreviewError(error.message);
      setPreviewData(null);
    } finally { 
      setIsLoadingPreview(false);
    }
  };

  const handleTextColumnChange = (event) => {
    const value = parseInt(event.target.value);
    if (value >= 1 && value <= (previewData?.headers.length || 0)) {
      setSelectedColumn(value);
    } else {
      setSelectedColumn(null);
      setValue('textColumn', '');
    } 
  };

  const handleColumnSelect = (columnIndex) => {
    setSelectedColumn(columnIndex);
    setValue('textColumn', columnIndex.toString()); //textcolumn: '[index]'
  };
  
  const handleSheetChange = async (sheetName) => {
    if (previewData && sheetName !== selectedSheet) {
      console.log(sheetName);
      setSelectedSheet(sheetName);
      // Get the current file from the watch function
      const currentFiles = watch('file');
      if (currentFiles && currentFiles[0]) {
        await loadPreview(currentFiles[0], sheetName);
      }
    }
  };
  const AIModels = [
    {
      name: 'Google Gemini 2.5 Flash-Lite',
      value: 'gemini-2.5-flash-lite',
      speed: 3,
      intelligence: 1,
      premium: false 
    },
    {
      name: 'Google Gemini 2.5 Flash',
      value: 'gemini-2.5-flash',
      speed: 2,
      intelligence: 2,
      premium: true
    },
    {
      name: 'Google Gemini 2.5 Pro',
      value: 'gemini-2.5-pro',
      speed: 1,
      intelligence: 3,
      premium: true
    },
    {
      name: 'OpenAI GPT-5-nano',
      value: 'gpt-5-nano',
      speed: 3,
      intelligence: 1,
      premium: true
    },
    {
      name: 'OpenAI GPT-5 mini',
      value: 'gpt-5-mini',
      speed: 2,
      intelligence: 2,
      premium: true
    },
    {
      name: 'OpenAI GPT-5',
      value: 'gpt-5',
      speed: 1,
      intelligence: 3,
      premium: true
    },
    {
      name: 'Anthropic Claude 4 Sonnet',
      value: 'claude-sonnet-4-20250514',
      speed: 2,
      intelligence: 2,
      premium: true
    }
  ]



const onSubmit = async (data) => {
  try {
    setSubmitError(''); //clear any previous errors

    // Ensure user is authenticated (anonymous if needed)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Anonymous sign-in failed:', error);
        setSubmitError('Failed to authenticate. Please try again.');
        return;
      }
    }

    const formData = new FormData();
    formData.append('file', data.file[0]);
    formData.append('textColumn', data.textColumn);

    // For custom sentiments, send the custom text as sentimentClassification
    // For standard options, send the selected option name
    const sentimentValue = data.sentimentClassification === 'Custom'
      ? data.customSentiments //the actual custom sentiments text
      : data.sentimentClassification;
    formData.append('sentimentClassification', sentimentValue);

    if (selectedSheet) formData.append('sheetName', selectedSheet);
    formData.append('aiModel', data.aiModel);
    if (isAnonymous && captchaToken) formData.append('captchaToken', captchaToken); // For anonymous user verification
    //formData.append('csrfToken', csrfToken); //append CSRF token for validation

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) { //since throw new Error() should have a error property
      const errorData = await response.json();
      const errorMessage = errorData.error || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    router.push(`/sentisheet/${result.id}`);
    
  } catch (error) {
    setSubmitError(error.message); // Display to user
  }
};

const timeEstimation = (previewData) => {
  if (!previewData) return null;

  const totalRows = previewData.totalRows || 0;
  const estimatedTime = Math.ceil(totalRows / 100) * 2; // Estimate 2 seconds per 100 rows

  return estimatedTime
};

console.log('isAnonymous:', isAnonymous);
  return (
    <div className="flex flex-1">
      <Sidebar/>
      <main className="flex-1 min-w-0">
      {!isSubmitting &&
      <>
      <ProgressBar value={calculateProgress() } max={3} />
      <h1 className='mt-2 text-3xl sm:text-5xl lg:text-6xl'>Submit SentiSheet Request</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-9xl mx-auto p-4 sm:p-6">
        <label className="flex flex-wrap items-center gap-3 text-lg sm:text-2xl font-medium">Spreadsheet file upload
          <input
              {...register("file", {
                required: "No spreadsheet selected.",
                onChange: handleFileUpload,
                validate: {
                    fileType: (fileList) => {
                      if (!fileList || fileList.length === 0) return true;
                      const file = fileList[0];
                      const allowedTypes = [
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "application/vnd.ms-excel",
                        "text/csv"
                      ];
                      if (!allowedTypes.includes(file.type)) return "Please upload a valid spreadsheet file (.xlsx, .xls, or .csv)";
                      return true;
                    },
                    fileSize: (fileList) => {
                      if (!fileList || fileList.length === 0) return true;
                      const file = fileList[0];
                      const maxSize = 3 * 1024 * 1024; // 3MB
                      if (file.size > maxSize) {
                        return "File size must be less than 3MB";
                      }
                      return true;
                    }
                  }
              })}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="min-w-0 max-w-full"
            />
        </label>
        {previewError && <span className="text-red-500 text-sm">{previewError}</span>}
        {errors.file && <span className="text-red-500 text-sm">{errors.file.message}</span>} 

        {/* Loading State */}
        {isLoadingPreview && (
          <div className="w-full text-center py-8">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading preview...
            </div>
          </div>
        )}

        {previewData && (
          <div className="w-full space-y-4">
            <h2 className="text-2xl font-semibold">Spreadsheet Preview</h2>
            <p className="text-foreground/60">
              Showing {previewData.previewData.length} of {previewData.totalRows} rows. Click on a column to select it for sentiment analysis.
            </p>
            {/* Column Selection Input */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-foreground/5 p-4 outlined">
              <label className="text-lg font-medium">
                Selected Column:
                <input
                  {...register("textColumn", {
                    required: "Column number is required.",
                    min: { value: 1, message: "Column number must be at least 1" },
                    max: { value: previewData.headers.length, message: `Column number must be at most ${previewData.headers.length}` },
                    pattern: { value: /^[0-9]+$/, message: "Column number must be a positive integer" }
                  })}
                  type="number"
                  min="1"
                  max={previewData.headers.length}
                  className="border border-foreground/20 rounded text-center bg-background"
                  onChange={handleTextColumnChange}
                />
              </label>
              <span className="text-foreground/60">
                of {previewData.headers.length}
                {selectedColumn && (
                  <span className="font-medium text-foreground">
                    → &quot;{previewData.headers[selectedColumn - 1]}&quot;
                  </span>
                )}
              </span>
            </div>
            {errors.textColumn && <span className="text-red-500 text-sm">{errors.textColumn.message}</span>}
            {/* Preview Table */}
            <div className="rounded-2xl overflow-hidden border-3 border-foreground">
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full border-collapse text-left">
                  {/* table header: */}
                  <thead className="bg-background">
                    {/*table row:*/}
                    <tr className="border-b-2 border-foreground/10">
                      {previewData.headers.map((header, index) => (
                        <th
                          key={index}
                          onClick={() => handleColumnSelect(index + 1)}
                          className={`px-4 py-3 text-left text-sm font-medium cursor-pointer transition-colors ${
                            selectedColumn === index + 1
                              ? 'bg-foreground/10'
                              : 'hover:bg-foreground/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{header}</span>
                            <span className="text-xs text-foreground/60 ml-2">#{index + 1}</span>
                          </div>
                          {selectedColumn === index + 1 && (
                            <div className="text-xs text-foreground/60 mt-1">Selected for analysis</div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-background">
                    {previewData.previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t-2 border-foreground/10 hover:bg-foreground/5 transition-colors">
                        {previewData.headers.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            onClick={() => handleColumnSelect(colIndex + 1)}
                            className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                              selectedColumn === colIndex + 1
                                ? 'bg-foreground/5'
                                : ''
                            }`}
                          >
                            <div className="max-w-xs truncate">
                              {row[header] || ''}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            {/* Sheet Tabs for Excel - Moved to bottom like real Excel */}
            {previewData.fileType === 'excel' && previewData.availableSheets && previewData.availableSheets.length > 1 && (
              <div className="bg-foreground/5 border-t border-foreground/10 p-2">
                <div className="flex space-x-1">
                  {/*FIX: buttons default to submit when inside a form*/}
                  {previewData.availableSheets.map((sheet, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSheetChange(sheet)}
                      className='px-3 py-1 rounded-t-lg border border-foreground/10 text-sm hover:cursor-pointer'
                    >
                      {sheet}
                    </button> 
                  ))}
                </div>
              </div>
            )}
            {previewData.fileType === 'excel' && previewData.availableSheets && (
              <div className="bg-foreground/5 rounded-lg p-4">
                <p className="text-sm text-foreground/60">
                  <strong>Current Sheet:</strong> {previewData.currentSheet}
                  {previewData.availableSheets.length > 1 && (
                    <>
                      {' • '}
                      <strong>Available Sheets:</strong> {previewData.availableSheets.join(', ')}
                    </>
                  )}
                </p>
              </div>
            )}
            </div>
          </div>
        )}
        {/* Sentiment Classification - Always visible */}
        <fieldset className="w-full min-w-0">
          <legend className="text-2xl font-semibold py-2">Sentiment Classification</legend>
          
          <div className="space-y-4 ">
            <label className="flex items-start space-x-3 p-4 outlined hover:cursor-pointer">
              <input 
                {...register("sentimentClassification", { required: "Sentiment classification is required." })}
                type="radio"
                value="Basic"
                className="mt-2"
              />
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                <p className="font-semibold">Basic Sentiment Classification</p>
                <div className="flex flex-wrap gap-2">
                  <span className="outlined-inner px-3">Positive</span>
                  <span className="outlined-inner px-3">Neutral</span>
                  <span className="outlined-inner px-3">Negative</span>
                </div>
              </div>
            </label>
            <label className="flex items-start space-x-3 p-4 outlined hover:bg-gray-50 cursor-pointer">
              <input 
                {...register("sentimentClassification", { required: "Sentiment classification is required." })}
                type="radio"
                value="Granular"
                className="mt-2"
              />
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                <p className="font-semibold">Granular Sentiment Classification</p>
                <div className="flex flex-wrap gap-2">
                  <span className="outlined-inner px-3">Very Positive</span>
                  <span className="outlined-inner px-3">Positive</span>
                  <span className="outlined-inner px-3">Neutral</span>
                  <span className="outlined-inner px-3">Negative</span>
                  <span className="outlined-inner px-3">Very Negative</span>
                </div>
              </div>
            </label>
              <label className="flex items-start space-x-3 p-4 outlined hover:bg-gray-50 cursor-pointer">
              <input 
                {...register("sentimentClassification", { required: "Sentiment classification is required." })}
                type="radio"
                value="Dr.Ekman"
                className="mt-2"
              />
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                <p className="font-semibold">Dr. Ekman&apos;s Six Basic Emotions</p>
                <div className="flex flex-wrap gap-2">
                  <span className="outlined-inner px-6">Anger</span>
                  <span className="outlined-inner px-6">Disgust</span>
                  <span className="outlined-inner px-6">Fear</span>
                  <span className="outlined-inner px-6">Happiness</span>
                  <span className="outlined-inner px-6">Sadness</span>
                  <span className="outlined-inner px-6">Surprise</span>
                </div>
              </div>
            </label> 
              <label className="flex items-start space-x-3 p-4 outlined hover:bg-gray-50 cursor-pointer">
              <input
                {...register("sentimentClassification", { required: "Sentiment classification is required." })}
                type="radio"
                value="Custom"
                className="mt-2"
                disabled={!isPremiumUser}
              />
              <div className="w-full">
                <p className="font-semibold">Custom Sentiment Classification</p>
                <input
                  {...register("customSentiments", {
                    validate: (value, formValues) => {
                      const isCustomSelected = formValues.sentimentClassification === "Custom";

                      if (isCustomSelected && (!value || value.trim() === '')) {
                        return "Please specify custom sentiment categories.";
                      }

                      // If there's any value at all (regardless of radio selection), validate it
                      if (value && value.trim() !== '') {
                        const pattern = /^[\p{L}\p{M}\s,''\-]+$/u;
                        if (!pattern.test(value.trim())) {
                          return "Custom sentiments may only contain letters, spaces, commas, apostrophes, and hyphens (no numbers or special symbols)";
                        }
                      }



                      return true;
                    }
                  })}
                  type="text"
                  disabled={!isPremiumUser}
                  placeholder= "Enter custom sentiments separated by commas"
                  className="border border-gray-300 rounded px-3 py-2 mt-2 w-full"
                />
                {errors.customSentiments && <span className="text-red-500 text-sm block mt-1">{errors.customSentiments.message}</span>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                  {watch("customSentiments")?.split(',').map((sentiment, index) => (
                    <span key={index}>{sentiment.trim()}</span>
                  ))}
                </div>
              </div>
            </label>                       
          </div>
          {errors.sentimentClassification && <span className="text-red-500 text-sm">{errors.sentimentClassification.message}</span>}
        </fieldset>
        <fieldset className="w-full min-w-0">
        <legend className="text-2xl font-semibold py-2">AI Model</legend>
        <div className="rounded-2xl border-3 border-foreground bg-background overflow-x-auto">
        <table className="w-full min-w-max text-left border-separate border-spacing-0 p-4">
          <thead>
            <tr className="">
              <th className="p-3">Model name</th>
              <th className="p-3">Speed</th>
              <th className="p-3">Intelligence</th>
            </tr>
          </thead>
          <tbody>
            {AIModels.map((model, index) => (
              <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                <td>
                  <label className={`flex items-start space-x-3 p-4 cursor-pointer` + (model.premium && isPremiumUser ? '' : 'bg-opacity-60')}>
                    <input
                      {...register("aiModel", { required: "AI model is required." })}
                      type="radio"
                      value={model.value}
                      className="mt-2"
                      disabled={model.premium && !isPremiumUser}
                    />
                    <p className="font-semibold">{model.name}</p>
                  </label>
                </td>
                <td>
                  <div className="flex items-center space-x-3">
                    {Array.from({ length: model.speed }, (_, i) => (
                      <Speed key={i} className=""/>
                    ))}
                    {Array.from({ length: 3 - model.speed }, (_, i) => (
                      <Speed key={i} className="invert"/>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="flex items-center space-x-3">
                    {Array.from({ length: model.intelligence }, (_, i) => (
                      <Intelligence key={i} className=""/>
                    ))}
                    {Array.from({ length: 3 - model.intelligence }, (_, i) => (
                      <Intelligence key={i} className="invert"/>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {errors.aiModel && <span className="text-red-500 text-sm">{errors.aiModel.message}</span>}
      </fieldset>

          {isAnonymous && (
            <div className="mt-4">
            <HCaptcha
              sitekey={siteKey}
              onVerify={token => setCaptchaToken(token)}
              ref={captcha}
            />
            </div>
          )}

        {submitError && <span className="text-red-500 text-sm">{submitError}</span>}
        <div className="flex flex-row items-center justify-center"> {/*spacing*/}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={`px-6 sm:px-12 py-3 rounded-lg text-lg sm:text-xl font-semibold outlined-inner mt-4 ${
              (isSubmitting || !isValid)
                ? 'opacity-60  cursor-not-allowed'
                : 'outlined cursor-pointer'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Submit SentiSheet Request'}
          </button>
        </div>        
      </form>
    </>
  }
      {isSubmitting && (
        <>
          <ProgressBar value={1.5} max={3} />    
          <h1 className="text-center text-3xl sm:text-5xl lg:text-6xl px-4">Processing request</h1>
          <p className="text-center px-4"> We received your SentiSheet request and are currently processing your request right now. </p>
          <p className="text-center px-4"> Estimated processing time: {timeEstimation(previewData)} seconds </p>
        </>
      )}
      </main>
    </div>
  )
}

export async function getServerSideProps({ req, res }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map(name => ({
            name,
            value: req.cookies[name]
          }));
        },
        setAll(cookiesToSet) {
          const cookies = cookiesToSet.map(({ name, value, options }) => {
            const optStr = options ? Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ') : '';
            return `${name}=${value}; Path=/; ${optStr}`;
          });
          const existing = res.getHeader('Set-Cookie') || [];
          const existingArray = Array.isArray(existing) ? existing : [existing];
          res.setHeader('Set-Cookie', [...existingArray, ...cookies]);
        },
      },
    }
  );

  let isPremiumUser = false;
  let isAnonymous = true;

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      isAnonymous = !user.email;

      const [userResult, sheetsResult] = await Promise.all([ // executing multiple asynchronous operations concurrently and waiting for all of them to complete. 
        supabase
          .from('users')
          .select('subscription_id')
          .eq('id', user.id)
          .single(),
        supabase
          .from('sentisheets')
          .select('id, file_name, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (!userResult.error && userResult.data?.subscription_id) {
        isPremiumUser = true;
      }
      console.log('userResult:', userResult);
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
  }

  return {
    props: {
      isPremiumUser,
      isAnonymous,
    },
  };
}