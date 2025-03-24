import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import argparse
import os
from tqdm import tqdm

def initialize_firebase():
    """Initialize Firebase connection using service account credentials"""
    # Path to your Firebase service account key
    cred_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                            'config', 'serviceAccountKey.json')
    
    if not os.path.exists(cred_path):
        raise FileNotFoundError(f"Firebase credentials file not found at {cred_path}")
    
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    return firestore.client()

def load_card_data(json_paths):
    """Load card data from one or more JSON files or directories"""
    all_cards = []
    all_json_files = []
    
    # Handle single path or list of paths
    if isinstance(json_paths, str):
        json_paths = [json_paths]
    
    # Find all JSON files in the provided paths
    for path in json_paths:
        if os.path.isdir(path):
            # If path is a directory, find all JSON files in it
            for root, _, files in os.walk(path):
                for file in files:
                    if file.lower().endswith('.json') and file.lower() != 'packs.json':
                        all_json_files.append(os.path.join(root, file))
        elif os.path.isfile(path) and path.lower().endswith('.json'):
            # If path is a JSON file, add it directly
            all_json_files.append(path)
        else:
            print(f"Warning: {path} is not a valid JSON file or directory")
    
    print(f"Found {len(all_json_files)} JSON files to process")
    
    # Process each JSON file
    for json_path in all_json_files:
        try:
            with open(json_path, 'r', encoding='utf-8') as file:
                cards = json.load(file)
                # Check if the loaded data is a list or needs to be extracted
                if isinstance(cards, dict) and 'cards' in cards:
                    cards = cards['cards']
                elif isinstance(cards, dict) and 'data' in cards:
                    cards = cards['data']
                
                if not isinstance(cards, list):
                    print(f"Warning: Unexpected format in {json_path}, expected a list of cards")
                    continue
                    
                print(f"Loaded {len(cards)} cards from {json_path}")
                all_cards.extend(cards)
        except FileNotFoundError:
            print(f"Warning: Card data file not found at {json_path}")
        except json.JSONDecodeError:
            print(f"Warning: Invalid JSON format in {json_path}")
        except Exception as e:
            print(f"Warning: Error processing {json_path}: {e}")
    
    if not all_cards:
        raise ValueError("No valid card data found in the provided paths")
    
    print(f"Total cards loaded: {len(all_cards)}")
    return all_cards

def main():
    parser = argparse.ArgumentParser(description='Upload OPTCG card data to Firebase')
    parser.add_argument('json_paths', nargs='+', help='Path(s) to the JSON file(s) containing card data')
    args = parser.parse_args()
    
    try:
        # Initialize Firebase
        db = initialize_firebase()
        
        # Load card data from all provided JSON files
        cards = load_card_data(args.json_paths)
        
        # Upload cards to Firebase
        upload_cards_to_firebase(db, cards)
        
        print("Card data upload completed successfully!")
        
    except Exception as e:
        print(f"Error: {e}")

def upload_cards_to_firebase(db, cards):
    """Upload card data to Firebase Firestore"""
    cards_collection = db.collection('cards')
    batch_size = 500  # Firestore has a limit of 500 operations per batch
    
    # Count total cards for progress bar
    total_cards = len(cards)
    print(f"Uploading {total_cards} cards to Firebase...")
    
    # Process cards in batches
    for i in range(0, total_cards, batch_size):
        batch = db.batch()
        current_batch = cards[i:i+batch_size]
        
        # Create a progress bar for the current batch
        with tqdm(total=len(current_batch), desc=f"Batch {i//batch_size + 1}") as pbar:
            for card in current_batch:
                # Use card ID or number as document ID
                doc_id = str(card.get('id', card.get('card_number')))
                if not doc_id:
                    print(f"Warning: Card missing ID: {card.get('name', 'Unknown')}")
                    continue
                
                # Add card to batch
                card_ref = cards_collection.document(doc_id)
                batch.set(card_ref, card, merge=True)
                pbar.update(1)
        
        # Commit the batch
        batch.commit()
        print(f"Committed batch {i//batch_size + 1}/{(total_cards + batch_size - 1)//batch_size}")

if __name__ == "__main__":
    main()