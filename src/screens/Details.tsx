import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { VStack, useTheme, HStack, Text, ScrollView, Box } from "native-base";
import { useRoute, useNavigation } from "@react-navigation/native";
import firestore from '@react-native-firebase/firestore';

import { Header } from "../components/Header";
import { OrderProps } from "../components/Order";
import { OrderFirestoreDTO } from '../DTOs/OrderDTO';
import { CircleWavyCheck, Hourglass, DesktopTower, ClipboardText } from 'phosphor-react-native';
import { dateFormat } from '../utils/firestoreDateFormat';
import { Loading } from '../components/Loading';
import { CardDetails } from '../components/CardDetails'
import { Input } from '../components/Input';
import { Button } from '../components/Button';

type RouteParams = {
    orderId: string;
}

type OrderDetails = OrderProps & {
    description: string;
    solution: string;
    closed: string;
}



export function Details(){
    const [ order, setOrder ] = useState<OrderDetails>({} as OrderDetails);
    
    const [ solution, setSolution ] = useState('');
    const [ isLoading, setIsLoading ] = useState(true);
    const route = useRoute();
    const { orderId } = route.params as RouteParams;
    const navigation = useNavigation();

    const { colors } = useTheme();

    function handleOrderClose(){
        if(!solution){
            return Alert.alert('Solicitação', 'Informe a solução para encerrar a solicitação.');
        }

        firestore()
        .collection<OrderFirestoreDTO>('orders')
        .doc(orderId)
        .update({
            status: 'closed',
            solution,
            create_at: firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            Alert.alert('Solicitação', 'Solicitação encerrada.');
            navigation.goBack();
        })
        .catch((error) => {
            console.log(error);
            return Alert.alert('Solicitação', 'Não foi possível encerrar a solicitação.');
        });
    }

    useEffect(() => {
        firestore()
        .collection<OrderFirestoreDTO>('orders')
        .doc(orderId)
        .get()
        .then((doc) => {
            const { patrimony, description, status, create_at, closed_at, solution } = doc.data();

            const closed = closed_at ? dateFormat(closed_at) : null;

            setOrder({
                id: doc.id,
                patrimony,
                description,
                status,
                solution,
                when: dateFormat(create_at),
                closed
            });
            setIsLoading(false);
    
        })
    }, []);

    if(isLoading){
        return <Loading />
    }

    return (
        <VStack flex={1} bg="gray.700">
            <Box px={6} bg="gray.600" >
                <Header title="Solicitação" />
            </Box>
      
        <HStack
            bg="gray.500"
            justifyContent="center"
            p={4}
        >
            {
                order.status === 'closed'
                ? <CircleWavyCheck size={22} color={colors.green[300]} />
                : <Hourglass size={22} color={colors.secondary[700]} />
            }

            <Text 
                fontSize="sm"
                color={order.status === 'closed' ? colors.green[300] : colors.secondary[700]}
                ml={2}
                textTransform="uppercase"
            >
                {order.status === 'closed' ? 'finalizado' : 'em andamento'}
            </Text>

        </HStack>

        <ScrollView mx={5} showsHorizontalScrollIndicator={false} >
            <CardDetails
                title='equipamento'
                description={`Patrimônio ${order.patrimony}`}
                icon={DesktopTower}
                
            />
            <CardDetails
                title='descrição do problema'
                description={order.description}
                icon={ClipboardText}
                footer={`Registrado em ${order.when}`}
            />
            <CardDetails
                title='Solução'
                icon={CircleWavyCheck}
                description={order.description}
                footer={order.closed && `Encerado em ${order.closed}`}
            >
                {
                    order.status === 'open' &&
                    <Input
                    placehold="Descrição da Solução"
                    onChangeText={setSolution}
                    h={24}
                    textAlignVertical="top"
                    multiline
                />
                }
                
            </CardDetails>
            
        </ScrollView>

        {
            order.status === 'open' &&
            <Button 
                title='Encerrar solicitação'
                m={5}
                onPress={handleOrderClose}
            />
        }

        </VStack>
    )
}