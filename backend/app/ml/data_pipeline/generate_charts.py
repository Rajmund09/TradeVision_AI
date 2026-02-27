# Chart generation for CNN training
import matplotlib.pyplot as plt
import os


def generate_candlestick_chart(df, symbol, output_dir="data/charts"):
    """Generate candlestick chart image for CNN analysis"""
    os.makedirs(output_dir, exist_ok=True)
    
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Plot candlesticks
    width = 0.6
    width2 = 0.05
    
    for idx, row in df.iterrows():
        if row['Close'] >= row['Open']:
            color = 'green'
        else:
            color = 'red'
        
        ax.bar(idx, row['Close'] - row['Open'], width, bottom=row['Open'], color=color)
        ax.plot([idx, idx], [row['Low'], row['High']], color=color, linewidth=width2)
    
    ax.set_xlabel('Date')
    ax.set_ylabel('Price')
    ax.set_title(f'{symbol} - Candlestick Chart')
    
    output_path = os.path.join(output_dir, f"{symbol}_chart.png")
    plt.savefig(output_path, dpi=100, bbox_inches='tight')
    plt.close()
    
    return output_path
