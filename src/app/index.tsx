import {  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Button,
  Alert,
 } from 'react-native';
import { useState, useEffect } from 'react';
import type { Task } from '@/types/task';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { session } = useAuth();
  async function logout() {
    const { error } = await supabase.auth.signOut();
  
    if (error) {
      Alert.alert('Logout failed', error.message);
    }
  }


  const [tasks, setTasks] = useState<Task[]>([]);

  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    async function fetchTasks() {
      if (!session) return;
  
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, completed')
        .eq('user_id', session.user.id);
  
      if (error) {
        console.log('Error fetching tasks:', error.message);
        return;
      }
  
      setTasks(data ?? []);
    }
  
    fetchTasks();
  }, [session]);



const [filter, setFilter] = useState<
  'All' | 'Active' | 'Completed'
>('All');


const filteredTasks = tasks.filter((task) => {
  if (filter === 'Active') {
    return !task.completed;
  }

  if (filter === 'Completed') {
    return task.completed;
  }

  return true;
});


const completedTasks = tasks.filter(
  (task) => task.completed
).length;

const totalTasks = tasks.length

// delete task 
function deleteTask(id: string){
  setTasks((currentTasks) =>
  currentTasks.filter((task) => task.id != id)
);
}


//=================================================================
// function addTask() {
//   // check if input field is empty 

//   //trim() => this function removes space from the beginning  and end of the text. if the user enters
//   // nothing but spaces, the function stops instead of  creating an empty array 

//   if (newTask.trim() === '') {
//     return;
//   }

//   const task: Task = {
//     id: Date.now().toString(),
//     title: newTask.trim(),
//     completed: false,
//   };

//   setTasks((currentTasks) => [...currentTasks, task]);
//   setNewTask('');
// }



async function addTask() {
  if (newTask.trim() === '') {
    return;
  }

  if (!session) {
    Alert.alert('Error', 'You must be logged in.');
    return;
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: session.user.id,
      title: newTask.trim(),
      completed: false,
    })
    .select('id, title, completed')
    .single();

  if (error) {
    Alert.alert('Task error', error.message);
    return;
  }

  setTasks((currentTasks) => [...currentTasks, data]);

  setNewTask('');
}

//=================================================================

// const timeNow = Date.now().toString();



async function testConnection() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    console.log('Supabase connection error:', error.message);
    return;
  }

  console.log('Supabase connected successfully!');
  console.log('Tasks:', data);
}



  return (
    <View style={styles.container}>

      <Text style={styles.title}>My Tasks</Text>
      <Pressable
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
      <View style={styles.progressCard}>
      <Text style={styles.progressTitle}>
        Your Progress
      </Text>

      <Text style={styles.progressText}>
        {completedTasks} of {totalTasks} tasks completed
      </Text>

  <View style={styles.progressBar}>
    <View
      style={[
        styles.progressFill,
        {
          width:
            totalTasks === 0
              ? '0%'
              : `${(completedTasks / totalTasks) * 100}%`,
        },
      ]}
    />
  </View>
</View>

<View style={styles.filterContainer}>
  {(['All', 'Active', 'Completed'] as const).map(
    (option) => (
      <Pressable
        key={option}
        style={[
          styles.filterButton,
          filter === option && styles.activeFilterButton,
        ]}
        onPress={() => setFilter(option)}
      >
        <Text
          style={[
            styles.filterButtonText,
            filter === option && styles.activeFilterButtonText,
          ]}
        >
          {option}
        </Text>
      </Pressable>
    )
  )}
</View>



      <TextInput
        placeholder='Enter a new task'
        value={newTask}
        onChangeText={setNewTask}
        style={styles.input}
      />

      <Button title='Add Task' onPress={addTask} />
      
      {tasks.map((task) => (
        <View key={task.id} style={styles.taskRow}>
        
         <Pressable
          style={styles.taskText}
          onPress={() => {
            setTasks((currentTasks) =>
              currentTasks.map((item) =>
                item.id === task.id
                  ? { ...item, completed: !item.completed }
                  : item
              )
            );
          }}
        >

          <View style={styles.taskContent} >
            
          <View
            style={[
              styles.checkbox,
              task.completed && styles.checkboxCompleted,
            ]}
          >

            {task.completed && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>

            <Text
            style={[
              styles.taskTitle,
              task.completed && styles.completedTask,
            ]}
            >
              {task.title}
            </Text>
            </View>
        </Pressable>

        <Button title='Delete'
        color="red"
        onPress={()=> deleteTask(task.id)}
        />
      
      </View>
))}


</View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F7FB',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    marginBottom: 12,
    elevation: 2,
  },
  taskText:{
    flex: 1,
    padding: 10
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#7C83FD",
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },

  checkboxCompleted: {
    backgroundColor: "#7C83FD",
    borderColor: '#7C83FD'
  },

  checkmark: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 'bold'
  },

  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: '#25263A',
  },
  completedTask: {
    color: '#999999',
    textDecorationLine: 'line-through',
  },

  progressCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25263A',
    marginBottom: 8,
  },
  
  progressText: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 12,
  },
  
  progressBar: {
    height: 8,
    width: '90%',
    backgroundColor: '#E8E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '90%',
    backgroundColor: '#7C83FD',
    borderRadius: 8,
  },

  filterContainer: {
    flexDirection: 'row',
    width: '90%',
    gap: 8,
    marginBottom: 16,
    borderColor: '#fff',
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#ffffff'
  },
  
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#E8E8F0',
  },
  
  activeFilterButton: {
    backgroundColor: '#7C83FD',
  },
  
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
  
  activeFilterButtonText: {
    color: '#FFFFFF',
  },

  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});