
import React from 'react';
import { ShoppingBag, Truck, Calendar, Store, Coffee, Flower, Scissors, Hammer } from 'lucide-react';
import { Scheme } from './types';

export const BUSINESS_TYPES = [
  { id: 'fixed', label: 'স্থায়ী দোকান (Fixed Shop)', icon: <Store className="w-8 h-8" /> },
  { id: 'mobile', label: 'ঠেলা গাড়ী (Mobile Cart)', icon: <Truck className="w-8 h-8" /> },
  { id: 'seasonal', label: 'ঋতুভিত্তিক বিক্ৰেতা (Seasonal)', icon: <Calendar className="w-8 h-8" /> },
  { id: 'food', label: 'চাহ আৰু খাদ্য ষ্টল (Tea & Food Stall)', icon: <Coffee className="w-8 h-8" /> },
  { id: 'textiles', label: 'কাপোৰ আৰু বস্ত্ৰ বিক্ৰেতা (Apparel & Textiles)', icon: <ShoppingBag className="w-8 h-8" /> },
  { id: 'agriculture', label: 'ফল-মূল আৰু শাক-পাচলি (Fruits & Vegetables)', icon: <Store className="w-8 h-8" /> },
  { id: 'florist', label: 'ফুল আৰু পূজাৰ সামগ্রী (Florist & Puja Items)', icon: <Flower className="w-8 h-8" /> },
  { id: 'services', label: 'মেৰামতি আৰু কাৰিকৰী সেৱা (Repair & Technical Services)', icon: <Scissors className="w-8 h-8" /> },
  { id: 'handicrafts', label: 'হস্তশিল্প আৰু কুটিৰ উদ্যোগ (Handicrafts & Cottage Industry)', icon: <Hammer className="w-8 h-8" /> },
  { id: 'small_scale', label: 'ক্ষুদ্ৰ উদ্যোগ (MSME/Small Scale)', icon: <ShoppingBag className="w-8 h-8" /> },
];

export const SCHEMES: Scheme[] = [
  {
    id: 'svanidhi',
    title: 'PM SVANidhi (Assam First)',
    titleAs: 'পিএম স্বনিধি আঁচনি (অসম)',
    description: 'Working capital loan up to ₹50,000 for street vendors with 7% interest subsidy.',
    descriptionAs: 'পথৰ কাষৰ বিক্ৰেতাসকলৰ বাবে ৭% সূতৰ ৰেহাইৰে ৫০,০০০ টকালৈকে কাৰ্য্যকৰী মূলধনৰ ঋণ।',
    eligibility: 'All street vendors vending in urban areas of Assam on or before March 24, 2020.',
    eligibilityAs: '২৪ মাৰ্চ, ২০২০ তাৰিখৰ পূৰ্বে বা তাৰিখলৈকে অসমৰ চহৰ অঞ্চলত বেহা-বেপাৰ চলাই থকা পথৰ কাষৰ বিক্ৰেতাসকল।',
    documents: ['Aadhar Card', 'Vending Certificate (LoR)', 'Bank Passbook'],
    documentsAs: ['আধাৰ কাৰ্ড', 'ভেণ্ডিং প্ৰমাণপত্ৰ (LoR)', 'বেংক পাছবুক'],
    deadline: 'March 31, 2026',
    deadlineAs: '৩১ মাৰ্চ, ২০২৬'
  },
  {
    id: 'atmanirbhar-asom',
    title: 'Mukhyamantri Atmanirbhar Asom',
    titleAs: 'মুখ্যমন্ত্ৰী আত্মনিৰ্ভৰ অসম অভিযান',
    description: 'Financial assistance up to ₹2 Lakh for selected unemployed youth to establish micro-enterprises.',
    descriptionAs: 'নিৰ্বাচিত নিবনুৱা যুৱক-যুৱতীসকলক ক্ষুদ্ৰ উদ্যোগ স্থাপনৰ বাবে ২ লাখ টকালৈকে আৰ্থিক সাহায্য।',
    eligibility: 'Unemployed youth of Assam, age between 20-40 years, registered in Employment Exchange.',
    eligibilityAs: 'অসমৰ নিবনুৱা যুৱক-যুৱতী, বয়স ২০-৪০ বছৰ, এম্প্লয়মেণ্ট এক্সচেঞ্জত পঞ্জীয়ন থকা হ’ব লাগিব।',
    documents: ['Employment ID', 'Educational Proof', 'Bank Account', 'Domicile Certificate'],
    documentsAs: ['এম্প্লয়মেণ্ট এক্সচেঞ্জ আইডি', 'শিক্ষাগত অৰ্হতাৰ প্ৰমাণপত্ৰ', 'বেংক একাউণ্ট', 'অসমৰ স্থায়ী বাসিন্দাৰ প্ৰমাণপত্ৰ'],
    deadline: 'Ongoing FY 2025-26',
    deadlineAs: 'চলতি বিত্তীয় বৰ্ষ ২০২৫-২৬'
  },
  {
    id: 'svayem',
    title: 'SVAYEM Scheme',
    titleAs: 'স্বয়ম আঁচনি (অসম যুৱ সৱলীকৰণ)',
    description: 'Financial support for youth of Assam to take up income generating activities and trade.',
    descriptionAs: 'অসমৰ যুৱক-যুৱতীসকলক উপাৰ্জনক্ষম কাৰ্য্যকলাপ আৰু বজাৰত ব্যৱসায় কৰিবলৈ আৰ্থিক সাহায্য।',
    eligibility: 'Youth groups or individuals engaged in traditional crafts, tourism, handloom, tea, or cottage trades.',
    eligibilityAs: 'পৰম্পৰাগত কুটিৰ শিল্প, পৰ্য্যটন, তাঁতশাল, চাহ, বা ক্ষুদ্ৰ ব্যৱসায়ত নিয়োজিত অসমৰ যুৱক-যুৱতীসকল।',
    documents: ['Aadhar Card', 'Trade Registration Document', 'Group/Individual Bank Proof'],
    documentsAs: ['আধাৰ কাৰ্ড', 'ট্ৰেড পঞ্জীয়ন নথি', 'বেংক একাউণ্টৰ প্ৰমাণপত্ৰ'],
    deadline: 'December 31, 2025',
    deadlineAs: '৩১ ডিচেম্বৰ, ২০২৫'
  },
  {
    id: 'insurance',
    title: 'Mukhyamantri Vyapari Suraksha Bima',
    titleAs: 'মুখ্যমন্ত্ৰী ব্যৱসায়ী সুৰক্ষা বীমা আঁচনি',
    description: 'Accidental insurance coverage of up to ₹10 Lakh for all registered small traders/vendors in Assam.',
    descriptionAs: 'অসমৰ সকলো পঞ্জীভূত ক্ষুদ্ৰ ব্যৱসায়ী/বিক্ৰেতাৰ বাবে ১০ লাখ টকালৈকে আকস্মিক দুৰ্ঘটনা বীমা সুৰক্ষা।',
    eligibility: 'All small and micro-vendors registered on the Assam State Vendor Registry.',
    eligibilityAs: 'অসম ৰাজ্যিক বিক্ৰেতা পঞ্জীয়ন প’ৰ্টেলত পঞ্জীভূত সকলো ক্ষুদ্ৰ আৰু উপ-বিক্ৰেতা।',
    documents: ['Registration ID', 'Nominee Details', 'Aadhar Card'],
    documentsAs: ['পঞ্জীয়ন আইডি', 'মনোনীত ব্যক্তিৰ বিৱৰণ', 'আধাৰ কাৰ্ড'],
    deadline: 'Auto-renewal upon Registration',
    deadlineAs: 'পঞ্জীয়ন হ’লে আপোনা-আপুনি নবীকৰণ'
  }
];
