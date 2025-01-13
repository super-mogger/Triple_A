interface Exercise {
  name: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
}

interface MuscleData {
  muscle: string;
  value: number;
}

const detailedMuscleGroups = {
  Back: {
    'Latissimus Dorsi': ['Pull-ups', 'Lat Pulldowns', 'Bent Over Rows'],
    'Upper Trapezius': ['Shrugs', 'Face Pulls', 'Upright Rows'],
    'Middle Trapezius': ['Face Pulls', 'Seated Rows', 'Reverse Flyes'],
    'Lower Trapezius': ['Y-Raises', 'Prone Y Lifts'],
    'Rhomboids': ['Face Pulls', 'Seated Rows', 'Reverse Flyes'],
    'Erector Spinae': ['Deadlifts', 'Good Mornings', 'Back Extensions']
  },
  Chest: {
    'Upper Pectoralis': ['Incline Bench Press', 'Incline Dumbbell Press'],
    'Middle Pectoralis': ['Flat Bench Press', 'Push-ups', 'Dumbbell Press'],
    'Lower Pectoralis': ['Decline Bench Press', 'Dips'],
    'Serratus Anterior': ['Push-ups Plus', 'Straight Arm Pulldowns']
  },
  Shoulders: {
    'Anterior Deltoid': ['Military Press', 'Front Raises'],
    'Lateral Deltoid': ['Lateral Raises', 'Upright Rows'],
    'Posterior Deltoid': ['Reverse Flyes', 'Face Pulls'],
    'Rotator Cuff': ['External Rotations', 'Internal Rotations']
  },
  Arms: {
    'Biceps Brachii': ['Bicep Curls', 'Chin-ups', 'Hammer Curls'],
    'Triceps Brachii': ['Tricep Pushdowns', 'Skull Crushers', 'Diamond Push-ups'],
    'Brachialis': ['Hammer Curls', 'Reverse Curls'],
    'Forearms': ['Wrist Curls', 'Farmers Walks', 'Dead Hangs']
  },
  Legs: {
    'Quadriceps': ['Squats', 'Leg Press', 'Lunges'],
    'Hamstrings': ['Romanian Deadlifts', 'Leg Curls', 'Good Mornings'],
    'Calves': ['Calf Raises', 'Jump Rope'],
    'Glutes': ['Hip Thrusts', 'Glute Bridges', 'Bulgarian Split Squats'],
    'Hip Flexors': ['Leg Raises', 'High Knees'],
    'Adductors': ['Adductor Machine', 'Sumo Squats']
  },
  Core: {
    'Rectus Abdominis': ['Crunches', 'Planks', 'Leg Raises'],
    'Obliques': ['Russian Twists', 'Side Planks', 'Wood Chops'],
    'Transverse Abdominis': ['Vacuum Exercise', 'Dead Bug'],
    'Lower Back': ['Back Extensions', 'Superman Hold']
  }
};

export const calculateMuscleTargeting = (exercise: Exercise): MuscleData[] => {
  const muscleData: MuscleData[] = [];
  const allMuscleGroups = Object.entries(detailedMuscleGroups);

  // Process primary target muscles
  exercise.targetMuscles.forEach(targetMuscle => {
    // Find the muscle group this target belongs to
    const muscleGroup = allMuscleGroups.find(([_, muscles]) => 
      Object.keys(muscles).some(m => m.toLowerCase() === targetMuscle.toLowerCase())
    );

    if (muscleGroup) {
      const [groupName, muscles] = muscleGroup;
      
      // Add the specific targeted muscle with 100% activation
      muscleData.push({
        muscle: targetMuscle,
        value: 100
      });

      // Add related muscles in the same group with reduced activation
      Object.keys(muscles).forEach(muscleName => {
        if (muscleName.toLowerCase() !== targetMuscle.toLowerCase()) {
          muscleData.push({
            muscle: muscleName,
            value: 60
          });
        }
      });
    }
  });

  // Process secondary muscles with reduced activation
  exercise.secondaryMuscles.forEach(secondaryMuscle => {
    if (!muscleData.some(m => m.muscle.toLowerCase() === secondaryMuscle.toLowerCase())) {
      muscleData.push({
        muscle: secondaryMuscle,
        value: 40
      });
    }
  });

  return muscleData;
}; 