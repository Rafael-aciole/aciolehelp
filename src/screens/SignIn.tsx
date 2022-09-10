import { useState } from "react";
import { Alert } from "react-native";
import { VStack, Heading, Icon, useTheme } from "native-base";
import auth from '@react-native-firebase/auth';
import { Envelope, Key } from "phosphor-react-native";

import Logo from '../assets/logo_primary.svg';

import { Button } from "../components/Button";
import { Input } from "../components/Input";


export function SignIn() {
    const [ isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { colors } = useTheme();

    function handleSignIn(){
        if (!email || !password) {
            return Alert.alert('Login:', 'Informe e-mail e senha.');
        }

        setIsLoading(true);
        auth().signInWithEmailAndPassword(email, password)
        .catch((error) => {
            console.log(error);
            setIsLoading(false);

            if( error.code === 'auth/invalid-email'){
                return Alert.alert('Login:', 'E-mail ou senha inválido :( ')
            }
            if( error.code === 'auth/wrong-password'){
                return Alert.alert('Login:', 'E-mail ou senha inválido :( ')
            }
            if( error.code === 'auth/user-not-found'){
                return Alert.alert('Login:', 'Usuário não encontrado :( ')
            }  
            return Alert.alert('Login:', 'Não foi possível fazer login no sistema :(' );

        })
    }

    return (
        <VStack flex={1} alignItems="center" bg="gray.600" px={8} pt={24}>
            <Logo />

            <Heading color="gray.100" fontSize="xl" mt={20} mb={6}>
                Acesse sua conta
            </Heading>

            <Input onChangeText={setEmail} placeholder="E-mail" mb={4} InputLeftElement={<Icon as={<Envelope color={colors.gray[300]} />} ml={4} />} />
            <Input onChangeText={setPassword} placeholder="Senha" InputLeftElement={<Icon as={<Key color={colors.gray[300]} />} ml={4} />} secureTextEntry />
        
            <Button isLoading={isLoading}  title="Acessar" onPress={handleSignIn} w="full" mt={8} />
        </VStack>
    )
}