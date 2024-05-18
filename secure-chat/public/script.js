const socket = io();

const chat = document.getElementById('chat');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

// Encryption and decryption functions
async function encryptMessage(message, key) {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const algorithm = { name: 'AES-GCM', iv: iv };

    const encodedMessage = new TextEncoder().encode(message);
    const ciphertext = await crypto.subtle.encrypt(algorithm, key, encodedMessage);
    return { ciphertext: new Uint8Array(ciphertext), iv };
}

async function decryptMessage(encryptedMessage, key, iv) {
    const algorithm = { name: 'AES-GCM', iv: iv };
    const decrypted = await crypto.subtle.decrypt(algorithm, key, encryptedMessage);
    return new TextDecoder().decode(decrypted);
}

async function generateKey() {
    return crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

let key;

generateKey().then((generatedKey) => {
    key = generatedKey;
});

sendButton.addEventListener('click', async () => {
    const message = messageInput.value;
    const { ciphertext, iv } = await encryptMessage(message, key);
    socket.emit('send_message', {
        encryptedMessage: Array.from(ciphertext),
        iv: Array.from(iv),
        sender: 'User1',
        receiver: 'User2'
    });
    messageInput.value = '';
});

socket.on('receive_message', async (data) => {
    const { encryptedMessage, sender, iv } = data;
    const decryptedMessage = await decryptMessage(new Uint8Array(encryptedMessage), key, new Uint8Array(iv));
    chat.innerHTML += `<p><strong>${sender}:</strong> ${decryptedMessage}</p>`;
});