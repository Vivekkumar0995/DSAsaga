import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { IconName, dynamicIconImports } from 'lucide-react/dynamic';
import { learning_stats, learning_track } from '@/types/data_structure';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function snakeToTitleCase (str: String) {
   var splitStr = str.toLowerCase().split('_');
   for (var i = 0; i < splitStr.length; i++) {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   return splitStr.join(' '); 
}

export function spacedToSnakeCase (str: String) {
   return str.toLowerCase().replaceAll(" ", "_");
}


export function spacedToKebabCase (str: string) {
 return str
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
}

export function getSafeIconName(rawIconName: string) {
  const normalized = spacedToKebabCase(rawIconName) as IconName
  return normalized in dynamicIconImports ? normalized : "circle-alert" as IconName
}

export function getNumberOfCompletedLessons (learning_track: learning_track, learning_stats: learning_stats[] | undefined) {
   const corresponding_stats = learning_stats?.find(stats => stats.title === learning_track.title);
   return (corresponding_stats?.lesson_stats ?? []).filter((lesson_stat: any) => lesson_stat?.completed).length;
}

export function getTotalNumberOfCompletedLessons (learning_stats: learning_stats[]) {
   let nCompleted = 0;
   for (let stat of learning_stats) {
      nCompleted += (stat.lesson_stats).filter(l => l.completed).length;
   }
   return nCompleted;
}

export function getTotalNumberOfInProgressLessons (learning_stats: learning_stats[]) {
   let nProgress = 0;
   for (let stat of learning_stats) {
      nProgress += (stat.lesson_stats).filter(l => l.in_progress).length;
   }
   return nProgress;
}
export function getTotalNumberOfLessons (learning_tracks: learning_track[]) {
   let nLessons = 0;
   for(let track of learning_tracks){
      nLessons += track.lessons.length;
   }
   return nLessons;
}