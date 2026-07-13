# 📸 StampCut

> A beautiful home for your stamp cut memories.

## Overview

StampCut is a mobile-first application designed for collecting, organizing, and preserving stamp cut (photo booth) memories.

Unlike Instagram or other social media platforms, StampCut focuses on **personal memories**, not social interaction.

The application provides an elegant and minimalist gallery experience inspired by Locket's UI philosophy while remaining a personal digital photo album.

---

# Goal

Build a beautiful, fast, and modern Android application where users can:

- Save stamp cut photos
- Organize photos into albums
- Browse memories through a timeline
- Search memories easily
- Keep all memories safely backed up in the cloud

The application is **NOT** intended to become a social media platform.

---

# MVP Features

## Authentication

- Email & Password Login
- Google Sign In
- User Profile

---

## Gallery

- Upload stamp cut photo
- Delete photo
- Edit caption
- Mark as favorite
- View full image
- Lazy loading

---

## Albums

- Create album
- Edit album
- Delete album
- Move photos between albums
- Album cover

---

## Memories

Each photo stores:

- Capture Date
- Upload Date
- Caption
- Favorite
- Album

---

## Search

Users can search by:

- Album Name
- Caption
- Tags

---

## Favorites

Dedicated page displaying favorite memories.

---

## Profile

- Avatar
- Username
- Total Albums
- Total Photos

---

# Future Features

## Timeline

Display memories grouped by:

- Year
- Month

Example

2026

July
- First Date
- Cafe
- Vacation

June
- Graduation

---

## Tags

Example:

- Date
- Travel
- Friends
- Family
- Cafe
- Birthday

---

## Photo Booth Metadata

Optional metadata

- Photo Booth Brand
- Branch
- City
- Frame Theme

Example

Photoism
Life4Cuts
HaruFilm
Photomatic

---

## Map Memories

Display memories on a map based on location.

---

## Widget

Android Home Screen Widget displaying:

- Latest Memory
- Favorite Memory
- Random Memory

---

## AI Features (Future)

- Auto Tagging
- Duplicate Detection
- Memory Recommendation
- Smart Search
- OCR on Photo Booth Frames

---

# Design Philosophy

Minimal.

Elegant.

Clean.

Emotion-first.

The application should feel like opening a memory journal rather than scrolling through a social media feed.

---

# UI Inspiration

- Locket
- Pinterest
- Apple Photos
- Notion Gallery
- Google Photos (Gallery only)

---

# Color Palette

Primary:
- White

Secondary:
- Soft Gray

Accent:
- Warm Beige

Dark Mode:
- Supported

---

# Typography

Modern
Readable
Minimal

---

# Navigation

Bottom Navigation

- Home
- Albums
- Favorites
- Profile

---

# Tech Stack

## Frontend

- React Native
- Expo
- TypeScript
- Expo Router
- NativeWind
- Zustand
- TanStack Query
- React Hook Form
- Zod

---

## Backend

Supabase

Services

- Authentication
- PostgreSQL Database
- Storage
- Row Level Security

---

# Database

Users

Albums

Photos

Tags

PhotoTags

Favorites

---

# Folder Structure

```
src/

    app/

    components/

    features/

    hooks/

    services/

    lib/

    store/

    types/

    utils/

    assets/
```

---

# Non Goals

The application will NOT include:

- Followers
- Following
- Public Feed
- Likes
- Comments
- Messaging
- Stories
- Video Upload

StampCut is designed as a personal memory application.

---

# Development Principles

- Clean Architecture
- Modular Components
- Feature-Based Structure
- Type Safety
- Responsive Layout
- Offline Friendly
- Smooth Animation
- Accessibility Support

---

# Success Criteria (MVP)

Users should be able to:

1. Register
2. Login
3. Create albums
4. Upload stamp cut photos
5. Search memories
6. Organize albums
7. Favorite memories
8. View memories beautifully

---

# Vision

StampCut is not another social media application.

It is a private space where people can preserve and revisit their most meaningful stamp cut memories with a beautiful, calm, and delightful experience.