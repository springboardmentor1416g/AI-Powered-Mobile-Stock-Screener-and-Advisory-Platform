import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';

const SignupScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signup } = useAuth();

  const handleSignup = async () => {
    // Clear previous messages
    setError('');
    setSuccess('');

    // Validate empty fields
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    // Password length validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // Password strength validation
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain uppercase, lowercase, and numbers.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await signup(email, password);
      
      if (result.success) {
        // Success - show message
        setSuccess('Signup successful! Please log in to continue.');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      } else {
        // User-friendly error messages (no technical jargon)
        const message = result.message || '';
        
        if (message.toLowerCase().includes('already exists') || message.toLowerCase().includes('duplicate')) {
          setError('Account already exists. Please log in instead.');
        } else {
          setError('Unable to create account. Please try again later.');
        }
      }
    } catch (error) {
      // Hide technical errors from users
      setError('Unable to connect. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign up to get started</Text>

        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.errorBackground, borderColor: theme.error }]}>
            <Ionicons name="alert-circle" size={20} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={[styles.successContainer, { backgroundColor: '#d1fae5', borderColor: '#10b981' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={[styles.successText, { color: '#059669' }]}>{success}</Text>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Email"
          placeholderTextColor={theme.textTertiary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          editable={!loading}
          inputMode="email"
          required
        />

        <View style={[styles.passwordContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            style={[styles.passwordInput, { color: theme.textPrimary }]}
            placeholder="Password (min 8 characters)"
            placeholderTextColor={theme.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.passwordContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            style={[styles.passwordInput, { color: theme.textPrimary }]}
            placeholder="Confirm Password"
            placeholderTextColor={theme.textTertiary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
          >
            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={[styles.linkText, { color: theme.primary }]}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>

        {error && error.includes('already exists') && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { borderColor: theme.primary }]}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Go to Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
  },
});

export default SignupScreen;
