import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Button, 
  Modal, 
  TextInput, 
  Textarea, 
  Rating, 
  Badge,
  Spinner,
  Label
} from 'flowbite-react';
import { 
  HiOutlinePencilAlt, 
  HiOutlineTrash, 
  HiOutlineCheck, 
  HiOutlineX,
  HiExclamation
} from 'react-icons/hi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [currentReview, setCurrentReview] = useState(null);
  const [editFormData, setEditFormData] = useState({
    reviewerName: '',
    reviewerDescription: '',
    reviewerRate: 0,
    isApproved: false
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/reviews?showAll=true', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteReviewId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/reviews/${deleteReviewId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReviews(reviews.filter(review => review._id !== deleteReviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteReviewId(null);
    }
  };

  const handleEditClick = (review) => {
    setCurrentReview(review);
    setEditFormData({
      reviewerName: review.reviewerName,
      reviewerDescription: review.reviewerDescription,
      reviewerRate: review.reviewerRate,
      isApproved: review.isApproved
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRatingChange = (rating) => {
    setEditFormData({ ...editFormData, reviewerRate: rating });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/reviews/${currentReview._id}`, editFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setReviews(reviews.map(review => 
        review._id === currentReview._id ? response.data : review
      ));
      
      toast.success('Review updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const handleApproveToggle = async (review) => {
    try {
      if (review.isApproved) {
        // If already approved, update to not approved
        const response = await axios.put(
          `/api/reviews/${review._id}`, 
          { 
            ...editFormData,
            reviewerName: review.reviewerName,
            reviewerDescription: review.reviewerDescription,
            reviewerRate: review.reviewerRate,
            isApproved: false 
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        
        setReviews(reviews.map(r => 
          r._id === review._id ? response.data : r
        ));
        
        toast.success('Review unapproved');
      } else {
        // If not approved, use the approve endpoint
        const response = await axios.patch(
          `/api/reviews/${review._id}/approve`,
          {},
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        
        setReviews(reviews.map(r => 
          r._id === review._id ? { ...r, isApproved: true } : r
        ));
        
        toast.success('Review approved');
      }
    } catch (error) {
      console.error('Error toggling review approval:', error);
      toast.error('Failed to update review status');
      
      // Add more detailed error information
      if (error.response) {
        console.log('Error response:', error.response.data);
        console.log('Status code:', error.response.status);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Reviews</h1>
        <div className="flex gap-2">
          <div className="text-sm text-gray-500">
            Total reviews: <span className="font-bold">{reviews.length}</span>
          </div>
          <Button size="sm" onClick={() => fetchReviews()}>Refresh</Button>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-gray-500">No reviews found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Rating</Table.HeadCell>
              <Table.HeadCell>Description</Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {reviews.map((review) => (
                <Table.Row key={review._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {review.reviewerName}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex">
                      <Rating>
                        {[...Array(5)].map((_, i) => (
                          <Rating.Star 
                            key={i} 
                            filled={i < review.reviewerRate}
                          />
                        ))}
                      </Rating>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="max-w-xs truncate">
                    {review.reviewerDescription.length > 100 
                      ? `${review.reviewerDescription.substring(0, 100)}...` 
                      : review.reviewerDescription}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {review.isApproved ? (
                      <Badge color="success">Approved</Badge>
                    ) : (
                      <Badge color="warning">Pending</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button 
                        size="xs" 
                        color={review.isApproved ? "failure" : "success"}
                        onClick={() => handleApproveToggle(review)}
                      >
                        {review.isApproved ? (
                          <><HiOutlineX className="mr-1" /> Unapprove</>
                        ) : (
                          <><HiOutlineCheck className="mr-1" /> Approve</>
                        )}
                      </Button>
                      <Button 
                        size="xs" 
                        color="info"
                        onClick={() => handleEditClick(review)}
                      >
                        <HiOutlinePencilAlt className="mr-1" /> Edit
                      </Button>
                      <Button 
                        size="xs" 
                        color="failure"
                        onClick={() => handleDeleteClick(review._id)}
                      >
                        <HiOutlineTrash className="mr-1" /> Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiExclamation className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this review?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteConfirm}>
                Yes, delete it
              </Button>
              <Button color="gray" onClick={() => setIsDeleteModalOpen(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Review Modal */}
      <Modal
        show={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="lg"
      >
        <Modal.Header>Edit Review</Modal.Header>
        <Modal.Body>
          {currentReview && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reviewerName" value="Reviewer Name" />
                <TextInput
                  id="reviewerName"
                  name="reviewerName"
                  value={editFormData.reviewerName}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reviewerRate" value="Rating" />
                <div className="flex items-center mt-2">
                  <Rating>
                    {[...Array(5)].map((_, index) => (
                      <Rating.Star
                        key={index}
                        filled={index < editFormData.reviewerRate}
                        onClick={() => handleRatingChange(index + 1)}
                        className="cursor-pointer"
                      />
                    ))}
                  </Rating>
                  <span className="ml-2 text-gray-500">
                    {editFormData.reviewerRate} out of 5
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="reviewerDescription" value="Review Description" />
                <Textarea
                  id="reviewerDescription"
                  name="reviewerDescription"
                  value={editFormData.reviewerDescription}
                  onChange={handleEditChange}
                  required
                  rows={5}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isApproved"
                  name="isApproved"
                  checked={editFormData.isApproved}
                  onChange={handleEditChange}
                  className="rounded focus:ring-2 focus:ring-blue-500"
                />
                <Label htmlFor="isApproved" value="Approve this review" />
              </div>

              <div className="flex justify-end gap-2">
                <Button color="gray" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" color="success">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}