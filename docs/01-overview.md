# Overview

A 12-week weight-loss progress tracker for a gym trainer (coach) and their clients.

## Purpose

The coach enrolls clients into a 12-week program. Clients log their daily calorie intake and complete 3 workouts per week. The app calculates their calorie deficit and estimated weight loss, and the coach monitors everyone's progress from one dashboard.

## Roles

| Role | What they do |
|------|--------------|
| **Coach** | Creates and manages clients, monitors progress across all clients |
| **Client** | Logs daily calories, checks off workouts, views their own progress |

## Program structure

- Fixed duration: **12 weeks** per client.
- Each client has their **own start date** (a Monday). Week number is derived from the real current date and that start date.
- Each week has **3 fixed workouts**:

| Workout | Calories burned |
|---------|----------------|
| Lower Body | 210 |
| Upper Body Push | 262.5 |
| Upper Body Pull | 210 |
