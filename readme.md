Conceptos

Query:

Query en un crud: Permite leer registro, en crud el query de graphql vendria siendo la R
Forma de extraer la informacion existente desde la base de datos
Query, declara que datos requieres para tu consulta y tambien soporta parametros (input)
El query es universal
ej:

query{
obtenerProductos{
id
nombre
precio
stock
}
}

////////////////////////

Un mutation se utiliza para las otras acciones del crud, actualizar, eliminar y crear registros
Para obtener registros, query, para lo demas mutations
Son similares a un put/patch delete/post en una rest api
Son independientes del lenguaje

Su sintaxis:

mutation eliminarProducto($id: ID){
eliminarProducto(id: $id)
}

///////////////////////

Schema describe tipos de objeto, queries y datos de tu app

query es el unico obligatiorio en tu schema, requieres un query y un resolver

El schema utiliza typing

Se relaciona mucho con el resolver, el schema define la forma de los datos mientras que el resolver se encarga de la comunicacion

type Cliente {
id: ID
nombre: String
apellido: String
empresa: String
email: [Email] puedes crear tus propios tipos de datos
edad: Int
}
type Email {
email: String
}

////////////////////////

Resolvers

Son funciones que son responsables de retornar los valores que existen en tu schema.
Queries y mutations por si solos no hacen muchos, requieren un backend para realizar las operaciones en la base de datos, ese backend son los resolvers

los nombres de los resolvers deben ser iguales a los definidos en el schema

ejemplo de resolver:

obtenerClientes: async ()=>{
const clientes = await clientes.find({});
return clientes;
}

////////////////////////

Schema

schema y resolver

type Query {
obtenerCliente(id: ID): Cliente
}

en el resolver:
obtenerClientes: async ()=>{
const clientes = await clientes.find({});
return clientes;
}
