# Lesson-Based Learning Workflow

This document outlines the lesson-based learning workflow integrated into the Yusha Farsi Journey application. The goal is to mirror the user's current learning process of adding items during weekly lessons and reviewing them later, while maintaining a consolidated view of all learned content on the homepage.

## Core Concepts

- **Lessons:** A concept representing a single learning session or topic. Learning items can be associated with one or more lessons.
- **Lesson View:** A dedicated view (`/lessons/[lessonId]`) displays all learning items introduced within a specific lesson, regardless of their status.
- **Main Grid View:** The homepage (`/`) displays only 'published' items, providing a curated view of all reviewed content.
- **Duplicate Handling:** The system handles content association, allowing the same learning item (e.g., the verb 'to go') to be included in multiple lessons without creating duplicate entries in the main content collection.

## Data Structure Implementation

### `/lessons` Collection

This collection stores information about each lesson.

- `name` (string): The title or topic of the lesson (e.g., "Lesson 5 - Past Tense").
- `date` (timestamp): The date the lesson took place.
- `notes` (string, optional): General notes related to the lesson.

### `/content` Collection Amendments

The existing `/content` collection, which stores learning items, has been modified to include fields for lesson association and status.

- `lessonIds` (array of strings): An array storing the IDs of the lessons that this learning item is associated with. This allows an item to appear in multiple lessons.
- `status` (string): Indicates the status of the learning item in the lesson workflow.
  - `'draft'`: Item added during a lesson but not yet reviewed/published to the main grid.
  - `'published'`: Item reviewed and available on the main homepage grid.

## Implemented Workflow & Content Management

The application provides a comprehensive interface for managing both lessons and the content within them.

1.  **Create Lesson:** A user can create a new lesson from the `/lessons` page, providing a name and date.
2.  **View & Manage Lessons:** The `/lessons` page lists all created lessons. Each lesson card has a menu allowing the user to **Edit** its details (name, date, notes) or **Delete** it. Deleting a lesson removes it permanently and unlinks it from any associated content items, but does not delete the content items themselves.
3.  **Add Items in Lesson Mode:** When viewing a specific lesson page (`/lessons/[lessonId]`), using the Floating Action Button (FAB) adds a new content item. This item is automatically associated with the current lesson ID and given a `status` of `'draft'`. In this mode, providing a `category` is optional for words and verbs to allow for quicker data entry during a lesson.
4.  **Review and Edit in Lesson View:** On the lesson detail page, each content card displays its current status ('draft' or 'published') and a menu with **Edit** and **Delete** options. The user can click the edit icon to open the admin dialog, modify the item's details (e.g., add a category, fix a typo), and change its status.
5.  **Publishing:** Once an item's status is changed to `'published'`, it becomes visible on the main homepage grid in addition to appearing in any lessons it is associated with.
6.  **Global Content Management:** Users can also **Edit** or **Delete** any published content item directly from the main homepage grid, providing a centralized place for content management outside of the lesson context. All delete actions trigger a confirmation dialog to prevent accidental data loss.
