import pika, sys, os
from background_task import background
from logging import getLogger
import africastalking


logger = getLogger(__name__)
@background(schedule=1000)
def processQueue():
    logger.debug('demo_task. message={0}'.format("message"))
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()
    
    channel.queue_declare(queue='sms')
    # channel.queue_declare(queue='email')
    
    def callback(ch, method, properties, body):
        message, recepient =parse_weather_message(body) 
        sendMessageAsSMS(message,recepient)
        print(f"received {body}")
    
    channel.basic_consume(queue='sms', on_message_callback=callback, auto_ack=True)
    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()
    
    
    
def sendMessageAsSMS(message,recepient):
   print (os.getenv('API_KEY'))
   africastalking.initialize(
    username=os.getenv('USERNAME'),
    api_key=os.getenv('API_KEY')
)

   sms = africastalking.SMS
   # Set your shortCode or senderId
   sender = os.getenv('SENDER')
   try:
         recipients = [f"{recepient}"]
         response = sms.send(message, recipients, sender)
         print(response)
         return (response)
   except Exception as e:
         print (f'Houston, we have a problem: {e}')
   return message

def parse_weather_message(text):
    # Find the position of the delimiter
    delimiter_index = text.find('#_#')
    
    if delimiter_index == -1:
        raise ValueError("Delimiter '#_#' not found in the text")
    
    # Split the text into two parts
    message_part = text[:delimiter_index].strip()
    phone_number_part = text[delimiter_index + 3:].strip()
    
    return message_part, phone_number_part
    
 
