import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import './SelectedPortfolio.css'
import { thunkGetPortfolios, thunkDeletePortfolio , thunkSetPortfolio} from "../../redux/portfolio";
import { useDispatch, useSelector } from "react-redux";

function SelectedPortfolio(){
    const {user_id, portfolio_id} = useParams()
    // const [portfolio , setPortfolio] = useState(null)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // const [error, setError] = useState('');


    const portfolio = useSelector(state => 
        state.portfolio.portfolios.find(p => p.id === parseInt(portfolio_id))
    );
    const error = useSelector(state => state.portfolio.error);

    useEffect(() => {
        if (!portfolio) {
            dispatch(thunkGetPortfolios(user_id));
            dispatch(thunkSetPortfolio(parseInt(portfolio_id)));
        }
        
        return () => {
        //   dispatch(clearSelectedPortfolio()); 
        };
    }, [dispatch, user_id, portfolio_id, portfolio]);
    
    
    const deletePortfolio = () => {
        dispatch(thunkDeletePortfolio(user_id, portfolio_id));
        navigate(`/portfolio/${user_id}`);
    };


    // useEffect(() => {
    //     const fetchPortfolioDetails = async () => {
    //         try {
    //             const response = await fetch(`/api/portfolio/${user_id}/${portfolio_id}`, {
    //                 method: 'GET',
    //                 headers: { 'Content-Type': 'application/json' },
    //             });

    //             if (response.ok) {
    //                 const data = await response.json();
    //                 setPortfolio(data.Portfolio);
    //             } else {
    //                 console.error('Error fetching portfolio:', response.status);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching portfolio data:', error);
    //         }
    //     };

    //     fetchPortfolioDetails();
    // }, [user_id, portfolio_id]);

    // const deleteport = async () => {
    //     try {
    //         const response = await fetch(`/api/portfolio/${user_id}/${portfolio_id}`, {
    //             method: 'DELETE',
    //             headers: { 'Content-Type': 'application/json' },
    //         });

    //         if (response.ok) {
    //             navigate(`/portfolio/${user_id}`);
    //         } else {
    //             const data = await response.json();
    //             setError(data.error || "An error occurred while deleting the portfolio.");
    //         }
    //     } catch (error) {
    //         console.error('Error deleting portfolio:', error);
    //         setError("An error occurred while deleting the portfolio.");
    //     }
    // };

    const tradenav = () => {
        navigate('/stocks');
    }
    
    const handleStockClick = (stock_name) => {
        if (stock_name) {
            navigate(`/stocks/${stock_name}`); 
        } else {
            console.error("Stock name is missing");
            alert("Unable to navigate to the stock details. Stock name is missing.");
        }
    };

    return(
        <div>
            <h1>Portfolio Details</h1>
            { portfolio && (
            <div className="portfolio-container">
                <div className="port-card">
                <h2><strong>Portfolio ID</strong>: {portfolio.id}</h2>
                <p><strong>Created At</strong>: {new Date(portfolio.created_at).toLocaleString()}</p>
                <p><strong>Balance</strong>: ${portfolio.balance}</p>
                <p><strong>Portfolio Total Value</strong>: ${portfolio.total_value}</p>
                <h3>Stocks:</h3>
                    {portfolio.stocks && portfolio.stocks.length > 0 ? (
                        <ul>
                            {portfolio.stocks.map((stock, index) => (
                                <li key={index} className="stock-item" onClick={() => handleStockClick(stock.stock_name)}>
                                    <p><strong>Name:</strong> {stock.stock_name}</p>
                                    <p><strong>Price:</strong> ${stock.volume_weighted_avg_price}</p>
                                    <p><strong>Purchase Price:</strong> ${stock.volume_weighted_avg_price}</p>
                                    <p><strong>Quantity:</strong> {stock.quantity}</p>
                                    {/* <p><strong>Date Purchased:</strong> {new Date(stock.date_purchased).toLocaleString()}</p> */}
                                    
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No stocks available in this portfolio.</p>
                    )}
                    <button onClick={deletePortfolio} className="delete">
                        Delete Portfolio
                    </button>
                    {error && <p className="error-message">{error}</p>}
            </div>
            <div className="trade-button-container">
                <button onClick={tradenav} className="trade-button">Trade on this portfolio
                </button>
            </div>
        </div>
        )}
    </div>
    )
}


export default SelectedPortfolio;